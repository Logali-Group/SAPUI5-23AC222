sap.ui.define([
    "sap/ui/core/mvc/Controller"
],function (Controller) {

    return Controller.extend("employees.controller.BaseController",{

        onInit: function () {

        },

        onBeforeRendering: function () {

        },

        onAfterRendering: function () {
            
        },

        onExit: function () {

        },

        onNavToOrders: function (oEvent) {

            let oItem = oEvent.getSource().getBindingContext("odataNorthwind"),
                sOrderID = oItem.getProperty("OrderID");

            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("orderDetails",{
                OrderId:  sOrderID
            });
        }

    });

});