sap.ui.define([

],function () {

    let oFormatter = {

        dateFormat: function (date) {

            let timeDay = 24 * 60 * 60 * 1000;

            if (date) {
                let oToday = new Date(),
                    oDateFormatOnlyDate = sap.ui.core.format.DateFormat.getDateInstance({pattern:'yyyy/MM/dd'}),
                    oDateFormat = new Date(oDateFormatOnlyDate.format(oToday)),
                    oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

                switch(true) {
                    case date.getTime() === oDateFormat.getTime():
                            return oResourceBundle.getText("today");
                    case date.getTime() === oDateFormat.getTime() + timeDay:
                            return oResourceBundle.getText("tomorrow");
                    case date.getTime() === oDateFormat.getTime() - timeDay:
                            return oResourceBundle.getText("yesterday");
                    default: return '';
                }
            }
        }
    };

    return oFormatter;
});