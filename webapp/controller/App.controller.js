sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("lists.controller.App", {

            onInit: function () {
                this.getView().getModel("ZTest");
                this.getOwnerComponent().getModel()
                let oModel = new JSONModel();
                    oModel.loadData("../model/ListData.json");
                this.getView().setModel(oModel);
            },

            getGroupHeader: function (oGroup) {
                console.log(oGroup);
                let oGroupHeaderListItem = new sap.m.GroupHeaderListItem({
                    title: oGroup.key,
                    upperCase: true
                });
                return oGroupHeaderListItem;
            },

            onShowSelectedItems: function () {
                let oStandardList = this.getView().byId("standardList"),
                    aSelectedItems = oStandardList.getSelectedItems(),
                    oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                    console.log(oStandardList);

                if (aSelectedItems.length === 0) {
                    sap.m.MessageToast.show(oResourceBundle.getText("noSelection"));
                } else {
                    var sMessage = oResourceBundle.getText("selection");

                    aSelectedItems.forEach((oItem)=>{
                        let oBindingContext = oItem.getBindingContext();
                        sMessage = sMessage +" - "+oBindingContext.getProperty("Material")
                    });

                    sap.m.MessageToast.show(sMessage);
                }
            },

            onDeleteSelectionItems: function () {
                let oStandardList = this.getView().byId("standardList"),
                    aSelectedItems = oStandardList.getSelectedItems(),
                    oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

                if (aSelectedItems.length === 0) {
                    sap.m.MessageToast.show(oResourceBundle.getText("noSelection"));
                } else {
                    var sMessage = oResourceBundle.getText("selection"),
                        oModel = this.getView().getModel(),
                        oProducts = oModel.getProperty("/Products"),
                        aId = [];

                    aSelectedItems.forEach((oItem)=>{
                        let oBindingContext = oItem.getBindingContext();
                        aId.push(oBindingContext.getProperty("Id"));
                        sMessage = sMessage+" - "+oBindingContext.getProperty("Material")
                    });

                    oProducts = oProducts.filter(function(p){
                        return !aId.includes(p.Id);
                    });

                    oModel.setProperty("/Products", oProducts);
                    oStandardList.removeSelections();
                    sap.m.MessageToast.show(sMessage);
                }
            },

            onDeleteItem: function (oEvent) {
                let oItem = oEvent.getParameter("listItem"),
                    oBindingContext = oItem.getBindingContext(),
                    sPath = oBindingContext.getPath(),
                    iIndex = sPath.split("/").splice(-1).pop(),
                    oModel = this.getView().getModel(),
                    oProducts = oModel.getProperty("/Products");
                    oProducts.splice(iIndex,1);
                    oModel.refresh();
            }
        });
    });
