sap.ui.define([
    "sap/ui/core/Control"
],function (Control) {

    return Control.extend("employees.control.Signature",{

        metadata: {
            properties: {
                width : {
                    type: "sap.ui.core.CSSSize",
                    defaultValue: "400px"
                },
                height: {
                    type: "sap.ui.core.CSSSize",
                    defaultValue: "100px"
                },
                bgcolor: {
                    type: "sap.ui.core.CSSColor",
                    defaultValue: "white"
                }
            }
        },

        init: function () {

        },

        renderer: function (oRm, oControl) {
            oRm.write("<div");
            oRm.addStyle("width", oControl.getProperty("width"));
            oRm.addStyle("height", oControl.getProperty("height"));
            oRm.addStyle("background-color", oControl.getProperty("bgcolor"));
            oRm.addStyle("border", "1px solid black");
            oRm.writeStyles();
            oRm.write(">");
            oRm.write("<canvas width='"+oControl.getProperty("width")+"' height='"+oControl.getProperty("height")+"'");
            oRm.write("></canvas>");
            oRm.write("</div>");
        },

        onAfterRendering: function () {
            let oCanvas = document.querySelector("canvas");
            try {
                this.signaturePad = new SignaturePad(oCanvas);
                this.signaturePad.fill = false;
                oCanvas.addEventListener("mousedown", function () {
                    this.signaturePad.fill = true;
                }.bind(this));
            } catch (error) {
                console.log(error);
            }
        },

        clear: function () {
            this.signaturePad.clear();
            this.signaturePad.fill = false;
        },


        isFill: function () {
            return this.signaturePad.fill;
        },

        getSignature: function () {
            return this.signaturePad.toDataURL();
        },

        setSignature: function (signature) {
            this.signaturePad.fromDataURL(signature);
        }

    });

});