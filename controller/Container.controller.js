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
            this._oEventBus.subscribe("Incidence","onSaveIncidence", this.onSaveODataIncidence, this);
            this._oEventBus.subscribe("Incidence", "onDeleteIncidence", function (sChannel, sNameEvent, oData) {

                let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

                let sUrl = "IncidentsSet(IncidenceId='"+oData.IncidenceId+"',SapId='"+oData.SapId+"',EmployeeId='"+oData.EmployeeID+"')";

                this.getOwnerComponent().getModel("incidenceModel").remove(sUrl, oData, {
                    success: function () {
                        this.onReadODataIncidence.bind(this)(sEmployeeId);
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

        onNavToOrders: function (oEvent) {
            let oItem = oEvent.getSource().getBindingContext("odataNorthwind"),
            sOrderID = oItem.getProperty("OrderID");
            console.log(sOrderID);
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("orderDetails",{
                OrderId:  sOrderID
            });
        },

        onSaveODataIncidence: function (sChannel, sEventName, oObj) {

            let oResourceBundle = this.getView().getModel("i18n").getResourceBundle(),
                sEmployeeId = this._oDetail.getBindingContext("odataNorthwind").getProperty("EmployeeID"),
                oIncidenceModel = this._oDetail.getModel("incidenceModel").getData();

            // console.log(oResourceBundle);
            // console.log(sEmployeeId);
            // console.log(oIncidenceModel);

            if (typeof oIncidenceModel[oObj.oIncidenceRow].IncidenceId == 'undefined') {

                let oData = {
                    SapId:              this.getOwnerComponent().SapId,
                    EmployeeId:         sEmployeeId.toString(),
                    CreationDate:       oIncidenceModel[oObj.oIncidenceRow].CreationDate,
                    Reason:             oIncidenceModel[oObj.oIncidenceRow].Reason,
                    Type:               oIncidenceModel[oObj.oIncidenceRow].Type
                };

                console.log(oData);

                let sUrl = "IncidentsSet",
                    oController = this;

                this.getOwnerComponent().getModel("incidenceModel").create(sUrl, oData, {
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

                let sUrl = "IncidentsSet(IncidenceId='"+oIncidenceModel[oObj.oIncidenceRow].IncidenceId+"',SapId='"+oIncidenceModel[oObj.oIncidenceRow].SapId+"',EmployeeId='"+oIncidenceModel[oObj.oIncidenceRow].EmployeeId+"')";

                this.getOwnerComponent().getModel("incidenceModel").update(sUrl, oData, {
                    success: function () {
                        this.onReadODataIncidence.bind(this)(sEmployeeId);
                        sap.m.MessageToast.show(oResourceBundle.getText("odataUpdayeOK"));
                    },
                    error: function (e) {
                        sap.m.MessageToast.show(oResourceBundle.getText("odataUpdateKO"));
                    }
                });
            }
        },

        onReadODataIncidence: function (sEmployeeId) {
            let sUrl = "/IncidentsSet";
            this.getOwnerComponent().getModel("incidenceModel").read(sUrl, {
                filters:[
                    new sap.ui.model.Filter("SapId","EQ", this.getOwnerComponent().SapId),
                    new sap.ui.model.filter("EmployeeId","EQ", sEmployeeId)
                ],
                success: function (data) {
                    let oIncidenceModel = this._oDetail.getModel("incidenceModel");
                        oIncidenceModel.setData(data.results);
                    let oTablaIncidence = this._oDetail.byId("tableIncidence");
                        oTablaIncidence.removeAllContent();
                    for (let oIncidence in data.results) {
                        let oNewIncidence = sap.ui.xmlfragment("employees.fragment.NewIncidence", this._oDetail.getController());
                        this._oDetail.addDependent(oNewIncidence);
                        oNewIncidence.bindElement("incidenceModel>/"+oIncidence);
                        oTablaIncidence.addContent(oNewIncidence);
                    }
                },
                error: function (e) {}
            });


        }
    });

});
