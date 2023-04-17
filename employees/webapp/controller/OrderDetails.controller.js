sap.ui.define([
	"employees/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (
	BaseController,
	History,
	MessageBox
) {
	"use strict";

	return BaseController.extend("employees.controller.OrderDetails", {

		onInit: function () {

			let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("orderDetails").attachPatternMatched(this._onObjectMatched, this);

		},

		_onObjectMatched: function (oEvent) {

			this.onClearSignature();

			let oArg = oEvent.getParameter("arguments"),
				oController = this,
				$this = this;

			this.getView().bindElement({
				path:"/Orders("+oArg.OrderId+")",
				model: "odataNorthwind",
				events:{
					dataReceived: function (oData) {
						$this._readSignature.bind(oController)(oData.getParameter("data").OrderID, oData.getParameter("data").EmployeeID)
					}
				}
			});

			let oObjectContext = this.getView().getModel("odataNorthwind").getContext("/Orders("+oArg.OrderId+")").getObject();

			if (oObjectContext) {
				this._readSignature.bind(oController)(oObjectContext.OrderID, oObjectContext.EmployeeID);
			}

		},

		_readSignature: function (sOrderId, sEmployeeId) {
			let sUrl = "/SignatureSet(OrderId='"+sOrderId+"',SapId='"+this.getOwnerComponent().SapId+"',EmployeeId='"+sEmployeeId+"')";

			this.getView().getModel("incidenceModel").read(sUrl, {
				success: function (data) {
					let oSignature= this.getView().byId("signature");
					if (data.MediaContent !== "") {
						oSignature.setSignature("data:image/png;base64,"+data.MediaContent);
					}
				}.bind(this),
				error: function () {

				}
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
		},

		factoryOrderDetails: function (listId, oContext) {

			//oEvent.getSource().getBindingContext("odataNorthwind").getObject()
			let oObjectContext = oContext.getObject();
				oObjectContext.Currency = "EUR";

			let iUnitsInStock = oContext.getModel().getProperty("/Products("+oObjectContext.ProductID+")/UnitsInStock");

			if (oObjectContext.Quantity <= iUnitsInStock) {
				let oObjectListItem = new sap.m.ObjectListItem({
					title: "{odataNorthwind>/Products("+oObjectContext.ProductID+")/ProductName} ({odataNorthwind>Quantity})",
					number: "{parts:[{path:'odataNorthwind>UnitPrice'},{path:'odataNorthwind>Currency'}],type:'sap.ui.model.type.Currency',formatOptions:{showMeasure:false}}",
					numberUnit:"{odataNorthwind>Currency}"
				});
				return oObjectListItem;
			} else {
				let oCustomListItem = new sap.m.CustomListItem({
						content:[
							new sap.m.Bar({
								contentLeft: new sap.m.Label({text:"{odataNorthwind>/Products("+oObjectContext.ProductID+")/ProductName} ({odataNorthwind>Quantity})"}),
								contentMiddle: new sap.m.ObjectStatus({text:"{i18n>availableStock} {odataNorthwind>/Products("+oObjectContext.ProductID+")/UnitsInStock}", state:"Error"}),
								contentRight: new sap.m.Label({text:"{parts:[{path:'odataNorthwind>UnitPrice'},{path:'odataNorthwind>Currency'}],type:'sap.ui.model.type.Currency'}"})
							})
						]
				});	
				return oCustomListItem;
			}

		},

		onClearSignature: function () {
			let oSignature = this.getView().byId("signature");
				oSignature.clear();
		},

		onSaveSignature: function (oEvent) {
			let oSignature = this.byId("signature");
			let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			let sSignaturePng ;

			if (!oSignature.isFill()) {
				MessageBox.error(oResourceBundle.getText("fillSignature"));
			} else {
				sSignaturePng = oSignature.getSignature().replace("data:image/png;base64,","");
				let oBindingContext = oEvent.getSource().getBindingContext("odataNorthwind");
				let oData = {
					OrderId: oBindingContext.getProperty("OrderID").toString(),
					SapId:	this.getOwnerComponent().SapId,
					EmployeeId: oBindingContext.getProperty("EmployeeID").toString(),
					MimeType: "image/png",
					MediaContent: sSignaturePng
				};

				this.getView().getModel("incidenceModel").create("/SignatureSet", oData, {
					success: function () {
						MessageBox.information(oResourceBundle.getText("signatureSaved"));
					},
					error: function () {
						MessageBox.error(oResourceBundle.getText("signatureNotSaved"));
					}
				});
			}
		}
	});
});