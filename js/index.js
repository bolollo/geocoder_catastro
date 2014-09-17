var pUrbana = /\d{7}[a-zA-Z0-9]{7}\d{4}[A-Z]{2}/;
var pRustica = /\d{5}[A-Z]\d{8}\d{4}[A-Z]{2}/;
var pDirCadastre = /^[A-Z]{2}\s{1}\w+(?: \w\w+)*,\s?\d+/i;
var pDirTv = /^[A-Z]{2}\s{1}/i;
var pDirVia = /\s{1}\w+(?: \w\w+)*,\s?/i;
var pDirNum = /,\s?\d+/i;
var map;
jQuery(function(){
	
	//listado de tipos de vias de catastro
	var source = jQuery("#llistatTipus-template").html();
	var template = Handlebars.compile(source);
	var html = template(TIPUS_VIA_CADASTRE);
	jQuery('#llistatTipusCar').append(html);
	
	jQuery('#llistatTipusCar').on('click','a.list-group-item', function(event){
		event.preventDefault();
		if (jQuery.trim(jQuery('#adreca').val()) == ""){
			jQuery('#adreca').val(jQuery(this).data('tv'));
		}else{
			jQuery('#adreca').val(jQuery(this).data('tv') + " " + jQuery('#adreca').val());
		}
		jQuery('#llistaTipusModal').modal('hide');
	});
	
	jQuery('#llistatTipusCarrer').on('click',function(event){
		event.preventDefault();
		jQuery('#llistaTipusModal').modal('show');
	});
	
	//carga de municipios
	var sourceMunicipis = jQuery("#llistatMunicipis-template").html();
	var templateMunicipis = Handlebars.compile(sourceMunicipis);
		
	loadUsuariCacheAjax().then(function(results){
		console.debug(results);
		MUNICIPIS_ENTITAT = results.municipisDto;
		//console.debug(MUNICIPIS_ENTITAT);
		var html = templateMunicipis(MUNICIPIS_ENTITAT);
		jQuery('#municipi').append(html);
		if (url('?municipi')){
			jQuery('#municipi').select2("val", url('?municipi'));
			var codiMun = jQuery('#municipi').select2("val");
			if (codiMun != null){
				jQuery('#municipi').select2("readonly", true);
			}
		}
	});
	
	//Listado de calles municipio
	var sourceCarrers = jQuery("#llistatCarrers-template").html();
	var templateCarrers = Handlebars.compile(sourceCarrers);
	
	jQuery('#llistatCarrersList').on('click','a.list-group-item', function(event){
		event.preventDefault();
		jQuery('#adreca').val(jQuery(this).data('nom'));
		jQuery('#llistaCarrersModal').modal('hide');
	});
		
	jQuery('#llistatCarrers').on('click',function(event){
		event.preventDefault();
		veureLlistaCarrerCadastre().then(function(results){
			jQuery('#llistaCarrersModal').modal('show');
			jQuery('#llistatCarrersMsg').html("");
			if (results.ERROR){
				jQuery('#llistatCarrersMsg').html(results.ERROR);
			}else{
				if (results.control.cuerr){
					jQuery('#llistatCarrersMsg').html(results.lerr.err.des);
				}else{
					//console.debug(results.callejero.calle);
					var html = templateCarrers(results.callejero);
					jQuery('#llistatCarrersList').append(html);
				}
			}
		});
	});
	
	//boton de busqueda de calles
	var sourceRC = jQuery("#llistatRC-template").html();
	var templateRC = Handlebars.compile(sourceRC);
	
	jQuery('#llistatRCList').on('click','a.list-group-item', function(event){
		event.preventDefault();
		jQuery('#refcad').val(jQuery(this).data('rc'));
		jQuery('#llistaRCModal').modal('hide');
		jQuery('#btnEnviar').click();
	});
	
	jQuery('#btnCercar').on('click',function(event){
		event.preventDefault();
		var q = jQuery('#adreca').val();
		if ($('#municipi').val() == ''){
			jQuery('#msgError').html("Has de seleccionar un municipi")
			.fadeIn( 300 ).delay( 3000 ).fadeOut( 400 );
		}else if (jQuery('#adreca').val() == ''){
			jQuery('#msgError').html("La adreça ha de ser tipus via nom via, num portal. Ex CL MAJOR, 12")
			.fadeIn( 300 ).delay( 3000 ).fadeOut( 400 );
		}else{
			if (pDirCadastre.test(q)){
				var params = {
					codiIne: $('#municipi').val(),
					municipi: $("#municipi option:selected").text()
				};
				params = parseDirCadastre(params, q);
				cercaDirCadastre(params).then(function(results){
					//console.debug(results);
					jQuery('#llistaRCModal').modal('show');
					jQuery('#llistatRCMsg').html("");
					jQuery('#llistatRCList').html("");
					if (results.control.cuerr){
						jQuery('#llistatRCMsg').html(results.lerr.err.des);
					}else{
						if (results.control.cudnp == 1){
							var rc = results.bico.bi.idbi.rc;
							rc = rc.pc1 + rc.pc2 + rc.car + rc.cc1 + rc.cc2;
							jQuery('#refcad').val(rc);
							jQuery('#llistaRCModal').modal('hide');
							jQuery('#btnEnviar').click();
						}else{
							var html = templateRC(results.lrcdnp);
							jQuery('#llistatRCList').append(html);
						}
					}
				});
			}else{
				jQuery('#msgError').html("La adreça ha de tenir el format TIPUS_VIA NOM_VIA, NUM_PORTAL. Ex CL MAJOR, 12")
				.fadeIn( 300 ).delay( 3000 ).fadeOut( 400 );
			}
		}
	});
	
	//boton de obtener XY
	jQuery('#btnEnviar').on('click',function(event){
		event.preventDefault();
		if (jQuery('#refcad').val() != ''){
			var q = jQuery('#refcad').val();
			if (q.length == 20){
				if (pUrbana.test(q) || pRustica.test(q)){
					jQuery('#msgInfo').fadeIn( 300 );
					console.debug(q);
					var params = {
						rc: q.substring(0,14),
						epsg:"EPSG:4326"
					}
					cercaXYCadastre(params).then(function(results){
						if (results.control.cuerr != 0){
							jQuery('#msgError').html(results.lerr.err.des)
							.fadeIn( 300 ).delay( 3000 ).fadeOut( 400 );
						}else{
							muestraXYMapa(results);
						}
					});
				}else{
					jQuery('#msgError').html("La referència cadastral no té el format correcte")
					.fadeIn( 300 ).delay( 3000 ).fadeOut( 400 );
				}
			}else{
				jQuery('#msgError').html("La referència cadastral ha de tener 20 dígits")
				.fadeIn( 300 ).delay( 3000 ).fadeOut( 400 );
			}
		}else{
			jQuery('#msgError').html("La referència cadastral ha de tener 20 dígits")
			.fadeIn( 300 ).delay( 3000 ).fadeOut( 400 );
		}
	});
	
	//se genera el selector de municipios
	jQuery('#municipi').select2({allowClear: true});
	
	// create a map in the "map" div, set the view to a given place and zoom
	map = L.map('map').setView([41.4757, 1.9583], 8);
	
	// add an OpenStreetMap tile layer
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
});

function loadUsuariCacheAjax(){
	return jQuery.ajax({
		dataType: "json",
		url: 'data/usuari.json'
	}).promise();
}

function veureLlistaCarrerCadastre(){
	var codiCadastre = jQuery('#municipi').val();
	var provincia = codiCadastre.substring(0,2);
	var municipi = codiCadastre.substring(2,5);
	var params = {
		provincia: provincia,
		municipi: municipi
	};
	return jQuery.ajax({
		dataType: "json",
		data: params,
		url: 'cercaCarrersMunicipi.jsp'
	}).promise();
}

function parseDirCadastre(params, via){
	var prov = params.codiIne.substring(0,2);
	switch(prov){
		case "08":
			params.provincia = "BARCELONA";
			break;
		case "17":
			params.provincia = "GIRONA";
			break;
		case "25":
			params.provincia = "LLEIDA";
			break;
		case "43":
			params.provincia = "TARRAGONA";
			break;
	}
	var tv = via.match(pDirTv);
	tv = jQuery.trim(tv);
	var nv = via.match(pDirVia);
	nv = jQuery.trim(nv);
	nv = nv.replace(/,$/i, '');
	var portal = via.match(pDirNum);
	portal = jQuery.trim(portal);
	portal = portal.replace(/^,\s/i, '');
	params.sigla = tv;
	params.calle = nv;
	params.numero = portal;
	return params;
}

function cercaDirCadastre(params){
	return jQuery.ajax({
		dataType: "json",
		data: params,
		url: 'cercaCarrersCadastre.jsp'
	}).promise();
}

function cercaXYCadastre(params){
	return jQuery.ajax({
		dataType: "json",
		data: params,
		url: 'cercaXYCadastre.jsp'
	}).promise();
}

function muestraXYMapa(params){
	L.marker([params.coordenadas.coord.geo.ycen, params.coordenadas.coord.geo.xcen]).addTo(map)
    .bindPopup(params.coordenadas.coord.ldt)
    .openPopup();
	map.setView([params.coordenadas.coord.geo.ycen, params.coordenadas.coord.geo.xcen],16);
}