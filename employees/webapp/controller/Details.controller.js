sap.ui.define([
    "employees/controller/BaseController",
    "employees/model/formatter"
],function (BaseCotroller, formatter) {
    "use strict";

    return BaseCotroller.extend("emplyees.controller.Details",{
        
        formatter: formatter,

        onInit: function () {
            this._oEventBus = sap.ui.getCore().getEventBus();
        },

        onCreateIncidence: function () {
            let oTable = this.byId("tableIncidence"),
                oNewIncidence = sap.ui.xmlfragment("employees.fragment.NewIncidence", this),
                oIncidenceModel = this.getView().getModel("incidenceModel"),
                oData = oIncidenceModel.getData(),
                iIndex = oData.length;

                oData.push({index: iIndex + 1});
                oIncidenceModel.refresh();
                oNewIncidence.bindElement("incidenceModel>/"+iIndex);

                oTable.addContent(oNewIncidence);
        },

        onDeleteIncidence: function (oEvent) {
            let oIncidence = oEvent.getSource().getParent().getParent(),
                oIncidenceRow = oIncidence.getBindingContext("incidenceModel");
            let oData = {
                IncidenceId: oIncidenceRow.getProperty("IncidenceId"),
                SapId: oIncidenceRow.getProperty("SapId"),
                EmployeeID: oIncidenceRow.getProperty("EmployeeId")
            };
            this._oEventBus.publish("Incidence", "onDeleteIncidence", oData);
        },

        onSaveIncidence: function (oEvent) {
            let oIncidence = oEvent.getSource().getParent().getParent(),
                oIncidenceRow = oIncidence.getBindingContext("incidenceModel");
            this._oEventBus.publish("Incidence","onSaveIncidence", {oIncidenceRow: oIncidenceRow.getPath().replace("/","")});
        },

        updateIncidenceCreationDate: function (oEvent) {
            let oBindingContext = oEvent.getSource().getBindingContext("incidenceModel"),
                oObject = oBindingContext.getObject();
                oObject.CreationDateX = true;
        },

        updateIncidenceReason: function (oEvent) {
            let oBindingContext = oEvent.getSource().getBindingContext("incidenceModel"),
                oObject = oBindingContext.getObject();
                oObject.ReasonX = true;
        },

        updateIncidenceType: function (oEvent) {
            let oBindingContext = oEvent.getSource().getBindingContext("incidenceModel"),
                oObject = oBindingContext.getObject();
                oObject.TypeX = true;
        }
    });
});