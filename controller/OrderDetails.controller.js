sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (
	Controller,
	History
) {
	"use strict";

	return Controller.extend("employees.controller.OrderDetails", {

		onInit: function () {

			let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("orderDetails").attachPatternMatched(this._onObjectMatched, this);

		},

		_onObjectMatched: function (oEvent) {

			let oArg = oEvent.getParameter("arguments");

			console.log(oArg);

			this.getView().bindElement({
				path:"/Orders("+oArg.OrderId+")",
				model: "odataNorthwind"
			});

		},

		onBack: function (oEvent) {
			let oHistory = History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("container", true);
			}
		}
	});
});