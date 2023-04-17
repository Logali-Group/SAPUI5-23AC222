sap.ui.define([
    "employees/controller/BaseController",
    "sap/ui/model/json/JSONModel"
],function (BaseController, JSONModel) {

    "use strict";

    return BaseController.extend("employees.controller.Container",{

        onInit: function () {
            let oJSONModelEmployees = new JSONModel(),
                oJSONModelCountries = new JSONModel(),
                oJSONModelConfig = new JSONModel(),
                oJSONModelLayout = new JSONModel(),
                oView = this.getView(),
                oController = this;

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
            this._oEventBus.subscribe("Incidence","onSaveIncidence", this.onSaveODataIncidence, this);
            this._oEventBus.subscribe("Incidence", "onDeleteIncidence", function (sChannel, sNameEvent, oData) {

                let oResourceBundle = oController.getView().getModel("i18n").getResourceBundle();

                let sUrl = "/IncidentsSet(IncidenceId='"+oData.IncidenceId+"',SapId='"+oData.SapId+"',EmployeeId='"+oData.EmployeeID+"')";

                oController.getOwnerComponent().getModel("incidenceModel").remove(sUrl, {
                    success: function () {
                        oController.onReadODataIncidence(oData.EmployeeID);
                        sap.m.MessageToast.show(oResourceBundle.getText("odataDeleteOK"));
                    },
                    error: function (e) {
                        sap.m.MessageToast.show(oResourceBundle.getText("odataDeleteKO"));
                    }
                });   
            });
        },

        onBeforeRendering: function() {
            this._oDetail = this.getView().byId("details");
        },

        onShowEmployeeDetails: function (sChannel, sNameEvent, sPath) {
            let oDetails = this.getView().byId("details");
                oDetails.bindElement("odataNorthwind>"+sPath);
                this.getView().getModel("jsonLayout").setProperty("/ActiveKey","TwoColumnsMidExpanded");
            
            let oIncidenceModel = new JSONModel([]);
                oDetails.setModel(oIncidenceModel, "incidenceModel");
                oDetails.byId("tableIncidence").removeAllContent();
        },

        onSaveODataIncidence: function (sChannel, sEventName, oObj) {

            let oResourceBundle = this.getView().getModel("i18n").getResourceBundle(),
                sEmployeeId = this._oDetail.getBindingContext("odataNorthwind").getProperty("EmployeeID"),
                oIncidenceModel = this._oDetail.getModel("incidenceModel").getData();

            if (typeof oIncidenceModel[oObj.oIncidenceRow].IncidenceId == 'undefined') {

                let oData = {
                    SapId:              this.getOwnerComponent().SapId,
                    EmployeeId:         sEmployeeId.toString(),
                    CreationDate:       oIncidenceModel[oObj.oIncidenceRow].CreationDate,
                    Type:               oIncidenceModel[oObj.oIncidenceRow].Type,
                    Reason:             oIncidenceModel[oObj.oIncidenceRow].Reason
                };

                let sUrl = "/IncidentsSet";

                let oModel = this.getView().getModel("incidenceModel");

                    oModel.create(sUrl, oData, {
                    success: function () {
                        this.onReadODataIncidence.bind(this)(sEmployeeId);
                        sap.m.MessageToast.show(oResourceBundle.getText("odataSaveOK"));
                    }.bind(this),
                    error: function (e) {
                        sap.m.MessageToast.show(oResourceBundle.getText("odataSaveKO"));
                    }.bind(this)
                });
            } else if (oIncidenceModel[oObj.oIncidenceRow].CreationDateX || oIncidenceModel[oObj.oIncidenceRow].ReasonX || oIncidenceModel[oObj.oIncidenceRow].TypeX ) {
                //sap.m.MessageToast.show(oResourceBundle.getText("odataNoChanges"));
                let oData = {
                    CreationDate:       oIncidenceModel[oObj.oIncidenceRow].CreationDate,
                    CreationDateX:      oIncidenceModel[oObj.oIncidenceRow].CreationDateX,
                    Reason:             oIncidenceModel[oObj.oIncidenceRow].Reason,
                    ReasonX:            oIncidenceModel[oObj.oIncidenceRow].ReasonX,
                    Type:               oIncidenceModel[oObj.oIncidenceRow].Type,
                    TypeX:              oIncidenceModel[oObj.oIncidenceRow].TypeX
                };

                let sUrl = "/IncidentsSet(IncidenceId='"+oIncidenceModel[oObj.oIncidenceRow].IncidenceId+"',SapId='"+oIncidenceModel[oObj.oIncidenceRow].SapId+"',EmployeeId='"+oIncidenceModel[oObj.oIncidenceRow].EmployeeId+"')";
                let oController = this;

                this.getOwnerComponent().getModel("incidenceModel").update(sUrl, oData, {
                    success: function () {
                        oController.onReadODataIncidence.bind(oController)(sEmployeeId);
                        sap.m.MessageToast.show(oResourceBundle.getText("odataUpdateOK"));
                    },
                    error: function (e) {
                        sap.m.MessageToast.show(oResourceBundle.getText("odataUpdateKO"));
                    }
                });
            }
        },

        onReadODataIncidence: function (sEmployeeId) {

            let sUrl = "/IncidentsSet",
                sSapId = this.getOwnerComponent().SapId,
                oController = this;

            console.log(sEmployeeId);
            console.log(sSapId);

            this.getOwnerComponent().getModel("incidenceModel").read(sUrl, {
                filters:[
                    new sap.ui.model.Filter("SapId","EQ", sSapId),
                    new sap.ui.model.Filter("EmployeeId","EQ", sEmployeeId)
                ],
                success: function (data) {
                    let oIncidenceModel = oController._oDetail.getModel("incidenceModel");
                        oIncidenceModel.setData(data.results);
                    let oTablaIncidence = oController._oDetail.byId("tableIncidence");
                        oTablaIncidence.removeAllContent();
                    for (let oIncidence in data.results) {
                        let oNewIncidence = sap.ui.xmlfragment("employees.fragment.NewIncidence", oController._oDetail.getController());
                        oController._oDetail.addDependent(oNewIncidence);
                        oNewIncidence.bindElement("incidenceModel>/"+oIncidence);
                        oTablaIncidence.addContent(oNewIncidence);
                    }
                },
                error: function (e) {}
            });


        }
    });

});