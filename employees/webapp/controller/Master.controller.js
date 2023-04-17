sap.ui.define([
    "employees/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, Filter, FilterOperator) {
        "use strict";

        return BaseController.extend("employees.controller.Master", {

            onInit: function () {
                this._oEventBus = sap.ui.getCore().getEventBus();
            },

            onValidate: function (oEvent) {
                //this.byId("inputEmployee");
                let sValue = oEvent.getParameter("newValue"),
                    oInput = oEvent.getSource();
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
                var oJSONModel = this.getView().getModel("jsonCountries").getData(),
                    aFilters = [];

                if (oJSONModel.EmployeeId) {
                    aFilters.push(new Filter({
                        filters: [
                            new Filter("EmployeeID", FilterOperator.EQ, oJSONModel.EmployeeId),
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
            },

            onClearFilter: function () {

                let oModel = this.getView().getModel("jsonCountries"),
                    oEmployeeModel = this.getView().getModel("odataNorthwind");
                oModel.setProperty("/EmployeeId");
                oModel.setProperty("/CountryKey");

                let oTable = this.byId("tableEmployee"),
                    oBinding = oTable.getBinding("items");
                oBinding.filter([]);

                this.getView().byId("tableEmployee").setHeaderText("Employees: (" + oEmployeeModel.getProperty("/Amount") + ")");

            },

            onMessage: function (oEvent) {
                let oBindingContext = oEvent.getSource().getBindingContext("odataNorthwind");
                new sap.m.MessageToast.show(oBindingContext.getObject().PostalCode);
            },

            onShowCity: function () {
                let oConfig = this.getView().getModel("jsonConfig");
                oConfig.setProperty("/visibleCity", true);
                oConfig.setProperty("/visibleBtnShowCity", false);
                oConfig.setProperty("/visibleBtnHideCity", true);
            },

            onHideCity: function () {
                let oConfig = this.getView().getModel("jsonConfig");
                oConfig.setProperty("/visibleCity", false);
                oConfig.setProperty("/visibleBtnShowCity", true);
                oConfig.setProperty("/visibleBtnHideCity", false);
            },

            onShowOrders: function (oEvent) {
                let oOrdersTable = this.getView().byId("ordersTable");
                //Limpiar el contenedor
                oOrdersTable.destroyItems();

                //Obtener las ordenes
                let oItem = oEvent.getSource(),
                    oBindingContext = oItem.getBindingContext("odataNorthwind"),
                    oOrders = oBindingContext.getProperty("Orders");

                //console.log(oBindingContext.getObject().Orders);
                // console.log(oOrders);

                let aColumns = [],
                    aOrdersItems = [];

                //Creamos las columnas
                let oColumnOrder = new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>orderID}" }) }),
                    oColumnFreight = new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>freight}" }) }),
                    oColumnShipAddress = new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>shipAddress}" }) });
                aColumns.push(oColumnOrder, oColumnFreight, oColumnShipAddress);

                //Creamos los items
                oOrders.forEach((oOrder) => {
                    let oTemplate = new sap.m.ColumnListItem({
                        cells: [
                            new sap.m.ObjectIdentifier({ title: oOrder.OrderID }),
                            new sap.m.Text({ text: oOrder.Freight }),
                            new sap.m.Text({ text: oOrder.ShipAddress })
                        ]
                    });
                    aOrdersItems.push(oTemplate);
                });

                //Creamos la tabla
                let oTable = new sap.m.Table({
                    columns: aColumns,
                    items: aOrdersItems,
                    width: "auto"
                }).addStyleClass("sapUiSmallMargin");

                oOrdersTable.addItem(oTable);

                //*************************************************************************** */

                //Creamos una nueva tabla
                let oNewTable = new sap.m.Table();
                oNewTable.setWidth("auto");
                oNewTable.addStyleClass("sapUiSmallMargin");

                //Crear las columnas
                let oColumnOrderId2 = new sap.m.Column(),
                    oLabelOrderID = new sap.m.Label();
                oLabelOrderID.bindProperty("text", "i18n>orderID");
                oColumnOrderId2.setHeader(oLabelOrderID);
                oNewTable.addColumn(oColumnOrderId2);

                let oColumnFreight2 = new sap.m.Column(),
                    oLabelFreight = new sap.m.Label();
                oLabelFreight.bindProperty("text", "i18n>freight");
                oColumnFreight2.setHeader(oLabelFreight);
                oNewTable.addColumn(oColumnFreight2);

                let oColumnShipAddress2 = new sap.m.Column(),
                    oLabelShipAddress = new sap.m.Label();
                oLabelShipAddress.bindProperty("text", "i18n>shipAddress");
                oColumnShipAddress2.setHeader(oLabelShipAddress);
                oNewTable.addColumn(oColumnShipAddress2);

                //Creamos los items
                let oTemplate2 = new sap.m.ColumnListItem();

                let oCellOrderID = new sap.m.ObjectIdentifier();
                oCellOrderID.bindProperty("title", "odataNorthwind>OrderID");
                oTemplate2.addCell(oCellOrderID);

                let oCellFreight = new sap.m.Text();
                oCellFreight.bindProperty("text", "odataNorthwind>Freight");
                oTemplate2.addCell(oCellFreight);

                let oCellShipAddress = new sap.m.Text();
                oCellShipAddress.bindProperty("text", "odataNorthwind>ShipAddress");
                oTemplate2.addCell(oCellShipAddress);

                //Creamos el Binding
                let oBinding = {
                    path: 'Orders',
                    model: 'odataNorthwind',
                    template: oTemplate2
                };

                oNewTable.bindAggregation("items", oBinding);
                oNewTable.bindElement("odataNorthwind>" + oBindingContext.getPath());

                //Agregamos la nueva tabla en el HBox
                oOrdersTable.addItem(oNewTable);

            },

            onOpenDialog: function (oEvent) {
                let oItem = oEvent.getSource(),
                    oBindingContext = oItem.getBindingContext("odataNorthwind");

                if (!this.pDialogOrders) {
                    this.pDialogOrders = sap.ui.xmlfragment("employees.fragment.DialogOrders", this);
                    this.getView().addDependent(this.pDialogOrders);
                }

                this.pDialogOrders.bindElement("odataNorthwind>" + oBindingContext.getPath());
                this.pDialogOrders.open();
            },

            onCloseOrders: function () {
                this.pDialogOrders.close();
            },

            onNavToDetails: function (oEvent) {
                let oBinding = oEvent.getSource().getBindingContext("odataNorthwind"),
                    sPath = oBinding.getPath();

                this._oEventBus.publish("Layout", "onNavToDetails", sPath);
            }

        });
    });
