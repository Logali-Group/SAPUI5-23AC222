sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("employees.controller.App", {

            onInit: function () {
                let oJSONModel = new sap.ui.model.json.JSONModel(),
                    oView = this.getView(),
                    oResourceBundle = oView.getModel("i18n").getResourceBundle();

                oJSONModel.loadData("../localService/mockdata/Employees.json");
                oView.setModel(oJSONModel);
            },

            onValidate: function (oEvent) {
                console.log(oEvent.getParameters());
                //this.byId("inputEmployee");
                let sValue = oEvent.getParameter("newValue"),
                    oInput = oEvent.getSource();
                console.log(oInput);
                if (sValue.length === oInput.getMaxLength()) {
                    //oInput.setDescription("Ok");
                    // this.getView().byId("labelCountry").setVisible(true);
                    // this.getView().byId("selectCountry").setVisible(true);
                } else {
                    //oInput.setDescription("Not Ok");
                    // this.getView().byId("labelCountry").setVisible(false);
                    // this.getView().byId("selectCountry").setVisible(false);
                }
            },

            onFilter: function () {
                var oJSONModel = this.getView().getModel().getData(),
                    aFilters = [];

                if (oJSONModel.EmployeeId) {
                    aFilters.push(new Filter({
                        filters:[
                            new Filter("EmployeeID", FilterOperator.Contains, oJSONModel.EmployeeId),
                            new Filter("FirstName", FilterOperator.Contains, oJSONModel.EmployeeId)
                        ],
                        and: false
                    }));
                }

                if (oJSONModel.CountryKey) {
                    aFilters.push(new Filter("Country", FilterOperator.EQ, oJSONModel.CountryKey));
                }

                let oTable = this.byId("tableEmployee"),
                    oBinding = oTable.getBinding("items");
                    oBinding.filter(aFilters);
                
                    let iAmount = oBinding.aIndices.length;
                    this.getView().byId("tableEmployee").setHeaderText("Employees: ("+iAmount+")");
            },

            onClearFilter: function () {

                let oModel = this.getView().getModel();
                    oModel.setProperty("/EmployeeId");
                    oModel.setProperty("/CountryKey");

                let oTable = this.byId("tableEmployee"),
                    oBinding = oTable.getBinding("items");
                    oBinding.filter([]);

                this.getView().byId("tableEmployee").setHeaderText("Employees: ("+oModel.getProperty("/Amount")+")");

            },

            onMessage: function (oEvent) {
                let oBindingContext = oEvent.getSource().getBindingContext();
                    console.log(oBindingContext.getObject());
                new sap.m.MessageToast.show(oBindingContext.getObject().PostalCode);
            }
        });
    });
