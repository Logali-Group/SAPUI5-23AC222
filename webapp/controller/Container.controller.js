sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],function (Controller, JSONModel) {

    "use strict";

    return Controller.extend("employees.controller.Container",{

        onInit: function () {
            let oJSONModelEmployees = new JSONModel(),
                oJSONModelCountries = new JSONModel(),
                oJSONModelConfig = new JSONModel(),
                oJSONModelLayout = new JSONModel(),
                oView = this.getView();

            oJSONModelEmployees.loadData("../localService/mockdata/Employees.json");
            oView.setModel(oJSONModelEmployees, "jsonEmployees");

            oJSONModelCountries.loadData("../localService/mockdata/Countries.json");
            oView.setModel(oJSONModelCountries, "jsonCountries");

            oJSONModelConfig.loadData("../localService/mockdata/Config.json");
            oView.setModel(oJSONModelConfig, "jsonConfig");

            oJSONModelLayout.loadData("../localService/mockdata/Layout.json");
            oView.setModel(oJSONModelLayout, "jsonLayout");

            this._oEventBus = sap.ui.getCore().getEventBus();
            this._oEventBus.subscribe("Layout","onNavToDetails", this.onShowEmployeeDetails, this);
        },

        onShowEmployeeDetails: function (sChannel, sNameEvent, sPath) {
            let oDetails = this.getView().byId("details");
                oDetails.bindElement("jsonEmployees>"+sPath);
                this.getView().getModel("jsonLayout").setProperty("/ActiveKey","TwoColumnsMidExpanded");
            
            let oIncidenceModel = new JSONModel([]);
                oDetails.setModel(oIncidenceModel, "incidenceModel");
                oDetails.byId("tableIncidence").removeAllContent();
        }
    });

});