sap.ui.define([
	"employees/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (
	BaseController,
	History,
	MessageBox,
	Filter,
	FilterOperator
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
						$this._readSignature.bind(oController)(oData.getParameter("data").OrderID, oData.getParameter("data").EmployeeID);
					}
				}
			});

			let oObjectContext = this.getView().getModel("odataNorthwind").getContext("/Orders("+oArg.OrderId+")").getObject();

			if (oObjectContext) {
				this._readSignature.bind(oController)(oObjectContext.OrderID, oObjectContext.EmployeeID);
			}

		},
		

		_readSignature: function (sOrderId, sEmployeeId) {
			let sSapId = this.getOwnerComponent().SapId,
				sUrl = "/SignatureSet(OrderId='"+sOrderId+"',SapId='"+sSapId+"',EmployeeId='"+sEmployeeId+"')";

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

				let oUploadSet = this.byId("uploadSet");

				oUploadSet.bindAggregation("items",{
					path:'incidenceModel>/FilesSet',
					filters:[
						new Filter("OrderId", FilterOperator.EQ, sOrderId),
						new Filter("SapId",FilterOperator.EQ, sSapId),
						new Filter("EmployeeId", FilterOperator.EQ, sEmployeeId) 	
					],
					template: new sap.m.upload.UploadSetItem({
						fileName: "{incidenceModel>FileName}",
						mediaType:"{incidenceModel>MimeType}",
						visibleEdit: false
					})
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
		},

		onFileBeforeUpload: function (oEvent) {

			let oItem = oEvent.getParameter("item"),
				oModel = this.getView().getModel("incidenceModel"),
				oBindingContext = oItem.getBindingContext("odataNorthwind"),
				sOrderId = oBindingContext.getProperty("OrderID").toString(),
				sSapId = this.getOwnerComponent().SapId,
				sEmployeId = oBindingContext.getProperty("EmployeeID").toString(),
				sFileName = oItem.getFileName(),
				sSecurityToken = oModel.getSecurityToken();

			let sSlug = sOrderId+";"+sSapId+";"+sEmployeId+";"+sFileName;

				//add token
				let oCustomerHeaderToken = new sap.ui.core.Item({
					key: "X-CSRF-Token",
					text: sSecurityToken
				});

				//add slug
				let oCustomerHeaderSlug = new sap.ui.core.Item({
					key: "Slug",
					text: sSlug
				});

				oItem.addHeaderField(oCustomerHeaderToken);
				oItem.addHeaderField(oCustomerHeaderSlug);
		},
		onFileUploadComplete: function (oEvent) {
			let oUploadSet = oEvent.getSource();
				oUploadSet.getBinding("items").refresh();
		},

		onFileDeleted: function (oEvent) {
			let oUploadSet = oEvent.getSource();
			var sPath = oEvent.getParameter("item").getBindingContext("incidenceModel").getPath();

			this.getView().getModel("incidenceModel").remove(sPath, {
				success: function () {
					oUploadSet.getBinding("items").refresh();
				},
				error: function () {
				}
			});
		},

		onDowloadFile: function () {

			let oUploadSet = this.byId("uploadSet"),
				oResourceBundle = this.getView().getModel("i18n").getResourceBundle(),
				aItems = oUploadSet.getSelectedItems();

				if (aItems.length === 0) {
					MessageBox.error(oResourceBundle.getText("selectFile"));
				} else {
					aItems.forEach((oItem)=>{
						let oBindingContext = oItem.getBindingContext("incidenceModel"),
							sPath = oBindingContext.getPath();
						window.open("/sap/opu/odata/sap/YSAPUI5_SRV_01" + sPath + "/$value");
					});
				}
		}
	});
});