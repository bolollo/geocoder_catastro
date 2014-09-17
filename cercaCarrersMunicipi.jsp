<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.net.*" %>
<%@ page import="java.io.*" %>
<%@ page import="java.util.*" %>
<%@ page import="org.w3c.dom.*" %>
<%@ page import="org.apache.commons.httpclient.*" %>
<%@ page import="org.apache.commons.httpclient.methods.*" %>
<%@ page import="net.sf.json.xml.XMLSerializer" %>
<%@ page import="net.sf.json.JSON" %>
<%@ page import="net.sf.json.JSONArray" %>
<%
response.setContentType("application/json");

HttpClient httpclient = new HttpClient();

String SERVIDOR_CATASTRO = "http://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/";
String SERVIDOR_CALLEJERO = SERVIDOR_CATASTRO+"OVCCallejeroCodigos.asmx/";
String RUTA_CATASTRO_VIA = SERVIDOR_CALLEJERO+"ConsultaViaCodigos?";

String jsonp = request.getParameter("jsonp");
String resp = "";
String provincia = request.getParameter("provincia");
String municipi = request.getParameter("municipi");

String peticio = RUTA_CATASTRO_VIA+"CodigoProvincia="+provincia+"&CodigoMunicipio="+municipi+"&CodigoMunicipioINE=&CodigoVia=&";
GetMethod httpget = new GetMethod(peticio);
try { 
	String respuesta = "";
	httpclient.executeMethod(httpget);
	String status=httpget.getStatusLine().toString();
	if(status.indexOf("OK") != -1){
		respuesta = httpget.getResponseBodyAsString();
	}else{
		out.write("{\"ERROR\":\"No es pot obtenir el llistat de vies\"}");
	}
	//respuesta = respuesta.replaceAll("'","@");
	JSON jsonResponse = new JSONArray();
    XMLSerializer xmlS= new XMLSerializer();
    xmlS.setSkipNamespaces(true);
    jsonResponse = xmlS.read(respuesta);
    resp = jsonResponse.toString();
   	if (jsonp != null){
   		resp = jsonp + "(" + resp + ")";
   	}
   	out.println(resp);
}catch(Exception e){
	e.printStackTrace();
}finally {
	httpget.releaseConnection();
}
%>