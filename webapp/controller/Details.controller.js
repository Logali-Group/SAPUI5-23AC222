sap.ui.define([
    "sap/ui/core/mvc/Controller"
],function (Controller) {
    "use strict";

    return Controller.extend("emplyees.controller.Details",{
        onInit: function () {
            
        },

        onCreateIncidence: function () {
            let oTable = this.byId("tableIncidence"),
                oNewIncidence = sap.ui.xmlfragment("employees.fragment.NewIncidence", this),
                oIncidenceModel = this.getView().getModel("incidenceModel"),
                oData = oIncidenceModel.getData(),
                iIndex = oData.lenght;

                oData.push({index: iIndex + 1});
                oIncidenceModel.refresh();
                oNewIncidence.bindElement("incidenceModel>"+iIndex);

                oTable.addContent(oNewIncidence);
        }
    });
});