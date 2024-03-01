sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/odata/v2/ODataModel',
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, ODataModel, MessageBox, MessageToast, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("sap.pp.wcare.wmd.workmanagerapp.controller.Initial_01", {
            onInit: function () {
                var that = this;
                var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
                var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
                oModel
                    .read(
                        "/ValueHelpSet?$filter=Key01 eq 'Default'",
                        {
                            context: null,
                            urlParameters: null,
                            async: false,
                            success: function (oData, oResponse) {
                                // that.showBusyIndicator();
                                try {
                                    console.log(oData);
                                    // Future
                                    if (oData.results.length === 1) {
                                        var Plant = oData.results[0].Data01;
                                        var Workcenter = oData.results[0].Data02;
                                        var Path = that.getView().getId();
                                        sap.ui.getCore().byId(Path + "--idInputPlant").setValue(Plant);
                                        sap.ui.getCore().byId(Path + "--idInputWorkCenter").setValue(Workcenter);
                                        // that.hideBusyIndicator();
                                        if (Plant != " ") {
                                            that.onLoadData(that, Plant, Workcenter);
                                        }
                                    }
                                } catch (e) {
                                    // that.hideBusyIndicator();
                                    alert(e.message);
                                }
                            },

                        });

            },
            onLoadData: function (that, Plant, Workcenter) {
                var othis = that;

                othis.showBusyIndicator();
                var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
                var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
                var IEntry = {};
                IEntry.Key01 = "READ";
                IEntry.Key02 = Plant;
                IEntry.Key03 = Workcenter;
                IEntry.Key04 = " ";
                IEntry.Key05 = " ";
                IEntry.WorkCenterArea = " ";
                IEntry.NavWC_InProgress = [{}];
                IEntry.NavWC_Queue = [{}];
                IEntry.NavWC_Future = [{}];

                console.log(IEntry);
                oDataModel
                    .create(
                        '/WorkCenter_AreaOrderSet',
                        IEntry,
                        null,
                        function (oData, Response) {

                            try {
                                console.log(oData);
                                othis.hideBusyIndicator();
                                var Path = othis.getView().getId();
                                // In Progress
                                var InProgressData = oData.NavWC_InProgress.results;
                                if (InProgressData.length === 0) {
                                    InProgressData = [{}];
                                }
                                var InProgressModel = new sap.ui.model.json.JSONModel();

                                InProgressModel.setData({
                                    "InProgressData": InProgressData
                                });
                                var InProgressTable = sap.ui.getCore().byId(Path + "--idInprogressOrderList");

                                InProgressTable.setModel(
                                    InProgressModel,
                                    'InProgressModel');
                                // }
                                // Queue
                                var InQueueData = oData.NavWC_Queue.results;
                                if (InQueueData.length === 0) {
                                    InQueueData = [{}];
                                }
                                var InQueueModel = new sap.ui.model.json.JSONModel();

                                InQueueModel.setData({
                                    "InQueueData": InQueueData
                                });
                                var InQueueTable = sap.ui.getCore().byId(Path + "--idQueueOrderList");

                                InQueueTable.setModel(
                                    InQueueModel,
                                    'InQueueModel');
                                // }
                                // Future
                                var InFutureData = oData.NavWC_Future.results;
                                if (InFutureData.length === 0) {
                                    InFutureData = [{}];
                                }
                                var InFutureModel = new sap.ui.model.json.JSONModel();

                                InFutureModel.setData({
                                    "InFutureData": InFutureData
                                });
                                var InFutureTable = sap.ui.getCore().byId(Path + "--idFutureOrderList");

                                InFutureTable.setModel(
                                    InFutureModel,
                                    'InFutureModel');
                                // }

                            }
                            catch (e) {
                                alert(e.message);
                                othis.hideBusyIndicator();
                            }


                        });
            },
            /* BUSY INDICATOR*/
            showBusyIndicator: function (iDuration, iDelay) {
                sap.ui.core.BusyIndicator.show(iDelay);

            },
            hideBusyIndicator: function () {
                sap.ui.core.BusyIndicator.hide();
            },
            onButtonPress: function () {
                var that = this;
                var Path = that.getView().getId();
                var Plant = sap.ui.getCore().byId(Path + "--idInputPlant").getValue();
                var Workcenter = sap.ui.getCore().byId(Path + "--idInputWorkCenter").getValue();
                that.onLoadData(that, Plant, Workcenter);
            },

            onValueHelpRequested: function () {

            },
            _onPlantHelp: function (oEvent) {
                var that = this;
                var Path = that.getView().getId();
                var SelPlant = sap.ui.getCore().byId(Path + "--idInputPlant").getValue();
                if (SelPlant === null) {
                    SelPlant = "MQTC";
                }
                if (!that.PlantDialog) {
                    that.PlantDialog = sap.ui.xmlfragment(
                        "sap.pp.wcare.wmd.workmanagerapp.Fragments.HelpPlant", that);
                    that.getView().addDependent(
                        that.PlantDialog);
                }
                // open value help dialog
                that.PlantDialog.open();
                var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
                var oModel = new sap.ui.model.odata.ODataModel(sUrl,
                    true);
                var oJsonModel = new sap.ui.model.json.JSONModel();
                // ?$filter=Werks eq '" + SelPlant + "'
                oModel
                    .read(
                        "/ZshWerksSet",
                        {
                            context: null,
                            urlParameters: null,
                            success: function (oData, oResponse) {
                                try {
                                    console.log(oData);
                                    // Future
                                    var Path = that.getView().getId();
                                    var PlantData = oData.results;
                                    var PlantModel = new sap.ui.model.json.JSONModel();

                                    PlantModel.setData({
                                        "PlantData": PlantData
                                    });
                                    var PlantTable = sap.ui.getCore().byId("idPlantDialog");

                                    PlantTable.setModel(
                                        PlantModel,
                                        'PlantModel');
                                } catch (e) {
                                    alert(e.message);
                                }
                            },

                        });
            },
            _onPlantSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("Werks", FilterOperator.Contains, sValue);
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);
            },

            _onPlantDialogClose: function (oEvent) {
                if (oEvent.getParameters().selectedItems != undefined) {
                    var Plant = oEvent.getParameters().selectedItems[0].getTitle();
                    if (Plant != undefined) {
                        var Path = this.getView().getId();
                        sap.ui.getCore().byId(`${Path}--idInputPlant`).setValue(Plant);
                        oEvent.getSource().getBinding("items").filter([]);
                    }
                    else {
                        // Raise Message
                        // MessageBox.information("Select any line to view BOM Details for the Production Order.");
                        return;
                    }
                }

            },

            _onWorkCenterHelp: function (oEvent) {
                var that = this;
                var Path = that.getView().getId();
                var SelPlant = sap.ui.getCore().byId(`${Path}--idInputPlant`).getValue();
                if (SelPlant === null) {
                    SelPlant = "MQTC";
                }
                if (!that.WCDialog) {
                    that.WCDialog = sap.ui.xmlfragment(
                        "sap.pp.wcare.wmd.workmanagerapp.Fragments.HelpWorkCenter", that);
                    that.getView().addDependent(
                        that.WCDialog);
                }
                // open value help dialog
                that.WCDialog.open();
                var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
                var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

                oModel
                    .read(
                        "/ZshArbplSet?$filter=Plant eq '" + SelPlant + "'",
                        {
                            context: null,
                            urlParameters: null,
                            success: function (oData, oResponse) {
                                try {
                                    console.log(oData);
                                    // Future
                                    var Path = that.getView().getId();
                                    var WorkCenterData = oData.results;
                                    var WorkCenterModel = new sap.ui.model.json.JSONModel();

                                    WorkCenterModel.setData({
                                        "WorkCenterData": WorkCenterData
                                    });
                                    var WorkCenterTable = sap.ui.getCore().byId("idWorkCenterDialog");

                                    WorkCenterTable.setModel(
                                        WorkCenterModel,
                                        'WorkCenterModel');
                                } catch (e) {
                                    alert(e.message);
                                }
                            },

                        });
            },
            onBOMPressed: function (oEvent) {
                var that = this;
                var index;
                var Path = that.getView().getId();
                var TabsArray = sap.ui.getCore().byId(`${Path}--ObjectPageLayout`).getSections(); // All Tab Details
                var TabSelect = sap.ui.getCore().byId(`${Path}--ObjectPageLayout`).getSelectedSection(); // Selected Tab Details
                for (var i = 0; i < TabsArray.length; i++) {
                    if (TabSelect === TabsArray[i].sId) {
                        index = i; // Getting Selected Tab validating Id
                        break;
                    }
                }
                var Tableindex = "X";
                var SelAufnr = " ";
                var SelOprNo = " ";
                if (index === 0) {
                    Tableindex = sap.ui.getCore().byId(`${Path}--idInprogressOrderList`).getSelectedIndices()[0];
                    // Get Order No & Opr No
                    SelAufnr = sap.ui.getCore().byId(`${Path}--idInprogressOrderList`).getModel("InProgressModel").getData().InProgressData[Tableindex].Data02;
                    SelOprNo = sap.ui.getCore().byId(`${Path}--idInprogressOrderList`).getModel("InProgressModel").getData().InProgressData[Tableindex].Data05;
                }
                if (index === 1) {
                    Tableindex = sap.ui.getCore().byId(`${Path}--idQueueOrderList`).getSelectedIndices()[0];
                    // Get Order No & Opr No
                    SelAufnr = sap.ui.getCore().byId(`${Path}--idQueueOrderList`).getModel("InQueueModel").getData().InQueueData[Tableindex].Data02;
                    SelOprNo = sap.ui.getCore().byId(`${Path}--idQueueOrderList`).getModel("InQueueModel").getData().InQueueData[Tableindex].Data05;
                }
                if (index === 2) {
                    Tableindex = sap.ui.getCore().byId(`${Path}--idFutureOrderList`).getSelectedIndices()[0];
                    // Get Order No & Opr No
                    SelAufnr = sap.ui.getCore().byId(`${Path}--idFutureOrderList`).getModel("InFutureModel").getData().InFutureData[Tableindex].Data02;
                    SelOprNo = sap.ui.getCore().byId(`${Path}--idFutureOrderList`).getModel("InFutureModel").getData().InFutureData[Tableindex].Data05;
                }
                if (Tableindex === undefined) {
                    // Raise Message
                    MessageBox.information("Select any line to view BOM Details for the Production Order.");
                    return;
                }
                if (!that.BOMDialog) {
                    that.BOMDialog = sap.ui.xmlfragment(
                        "sap.pp.wcare.wmd.workmanagerapp.Fragments.BOM", that);
                    that.getView().addDependent(
                        that.BOMDialog);
                }
                var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
                var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

                oModel
                    .read(
                        "/ValueHelpSet?$filter=Key01 eq 'BOM' and Key02 eq '" + SelAufnr + "' and Key03 eq '" + SelOprNo + "'",
                        {
                            context: null,
                            urlParameters: null,
                            success: function (oData, oResponse) {
                                try {
                                    console.log(oData);
                                    // Future
                                    var Path = that.getView().getId();
                                    var BOMData = oData.results;
                                    var BOMModel = new sap.ui.model.json.JSONModel();

                                    BOMModel.setData({
                                        "BOMData": BOMData
                                    });
                                    var BOMTable = sap.ui.getCore().byId("idBOMDialog");

                                    BOMTable.setModel(
                                        BOMModel,
                                        'BOMModel');
                                    // open value help dialog
                                    that.BOMDialog.open();
                                } catch (e) {
                                    alert(e.message);
                                }
                            },

                        });
            },
            onRoutePressed: function (oEvent) {
                var that = this;
                var index;
                var Path = that.getView().getId();
                var TabsArray = sap.ui.getCore().byId(`${Path}--ObjectPageLayout`).getSections(); // All Tab Details
                var TabSelect = sap.ui.getCore().byId(`${Path}--ObjectPageLayout`).getSelectedSection(); // Selected Tab Details
                for (var i = 0; i < TabsArray.length; i++) {
                    if (TabSelect === TabsArray[i].sId) {
                        index = i; // Getting Selected Tab validating Id
                        break;
                    }
                }
                var Tableindex = "X";
                var SelAufnr = " ";
                var SelOprNo = " ";
                if (index === 0) {
                    Tableindex = sap.ui.getCore().byId(`${Path}--idInprogressOrderList`).getSelectedIndices()[0];
                    // Get Order No & Opr No
                    SelAufnr = sap.ui.getCore().byId(`${Path}--idInprogressOrderList`).getModel("InProgressModel").getData().InProgressData[Tableindex].Data02;
                    SelOprNo = sap.ui.getCore().byId(`${Path}--idInprogressOrderList`).getModel("InProgressModel").getData().InProgressData[Tableindex].Data05;
                }
                if (index === 1) {
                    Tableindex = sap.ui.getCore().byId(`${Path}--idQueueOrderList`).getSelectedIndices()[0];
                    // Get Order No & Opr No
                    SelAufnr = sap.ui.getCore().byId(`${Path}--idQueueOrderList`).getModel("InQueueModel").getData().InQueueData[Tableindex].Data02;
                    SelOprNo = sap.ui.getCore().byId(`${Path}--idQueueOrderList`).getModel("InQueueModel").getData().InQueueData[Tableindex].Data05;
                }
                if (index === 2) {
                    Tableindex = sap.ui.getCore().byId(`${Path}--idFutureOrderList`).getSelectedIndices()[0];
                    // Get Order No & Opr No
                    SelAufnr = sap.ui.getCore().byId(`${Path}--idFutureOrderList`).getModel("InFutureModel").getData().InFutureData[Tableindex].Data02;
                    SelOprNo = sap.ui.getCore().byId(`${Path}--idFutureOrderList`).getModel("InFutureModel").getData().InFutureData[Tableindex].Data05;
                }
                if (Tableindex === undefined) {
                    // Raise Message
                    MessageBox.information("Select any line to view BOM Details for the Production Order.");
                    return;
                }
                if (!that.BOMDialog) {
                    that.BOMDialog = sap.ui.xmlfragment(
                        "sap.pp.wcare.wmd.workmanagerapp.Fragments.Routing", that);
                    that.getView().addDependent(
                        that.BOMDialog);
                }
                var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
                var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

                oModel
                    .read(
                        "/ValueHelpSet?$filter=Key01 eq 'Routing' and Key02 eq '" + SelAufnr + "' and Key03 eq '" + SelOprNo + "'",
                        {
                            context: null,
                            urlParameters: null,
                            success: function (oData, oResponse) {
                                try {
                                    console.log(oData);
                                    // Future
                                    var Path = that.getView().getId();
                                    var RoutingData = oData.results;
                                    var RoutingModel = new sap.ui.model.json.JSONModel();

                                    RoutingModel.setData({
                                        "RoutingData": RoutingData
                                    });
                                    var RoutingTable = sap.ui.getCore().byId("idRoutingDialog");

                                    RoutingTable.setModel(
                                        RoutingModel,
                                        'RoutingModel');
                                    // open value help dialog
                                    that.BOMDialog.open();
                                } catch (e) {
                                    alert(e.message);
                                }
                            },

                        });
            },
            _onWorkCenterSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("Workcenter", FilterOperator.Contains, sValue);
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);
            },

            _WorkCenterSelect: function (oEvent) {
                if (oEvent.getParameters().selectedItems != undefined) {
                    var Workcenter = oEvent.getParameters().selectedItems[0].getTitle();
                    if (Workcenter != undefined) {
                        var Path = this.getView().getId();
                        sap.ui.getCore().byId(`${Path}--idInputWorkCenter`).setValue(Workcenter);
                        oEvent.getSource().getBinding("items").filter([]);
                    }
                    else {
                        return;
                    }
                    this.onButtonPress();
                }
            },

            onDrawingPressed: function (oEvent) {
                // Navigation to Open File from FTP FIle path
                var that = this;
                var index;
                var Path = that.getView().getId();
                var TabsArray = sap.ui.getCore().byId(`${Path}--ObjectPageLayout`).getSections(); // All Tab Details
                var TabSelect = sap.ui.getCore().byId(`${Path}--ObjectPageLayout`).getSelectedSection(); // Selected Tab Details
                for (var i = 0; i < TabsArray.length; i++) {
                    if (TabSelect === TabsArray[i].sId) {
                        index = i; // Getting Selected Tab validating Id
                        break;
                    }
                }
                var Tableindex = "X";
                var SelMatnr = " ";
                if (index === 0) {
                    Tableindex = sap.ui.getCore().byId(`${Path}--idInprogressOrderList`).getSelectedIndices()[0];
                    // Get Material
                    SelMatnr = sap.ui.getCore().byId(`${Path}--idInprogressOrderList`).getModel("InProgressModel").getData().InProgressData[Tableindex].Data03;
                }
                if (index === 1) {
                    Tableindex = sap.ui.getCore().byId(`${Path}--idQueueOrderList`).getSelectedIndices()[0];
                    // Get Material
                    SelMatnr = sap.ui.getCore().byId(`${Path}--idQueueOrderList`).getModel("InQueueModel").getData().InQueueData[Tableindex].Data03;
                }
                if (index === 2) {
                    Tableindex = sap.ui.getCore().byId(`${Path}--idFutureOrderList`).getSelectedIndices()[0];
                    // Get Material
                    SelMatnr = sap.ui.getCore().byId(`${Path}--idFutureOrderList`).getModel("InFutureModel").getData().InFutureData[Tableindex].Data03;
                }
                if (Tableindex === undefined) {
                    // Raise Message
                    MessageBox.information("Select any line to view Drawing Details for the Material.");
                    return;
                }

                window.open("http://ftp://sbs.ferro.local/server/Fælles/Tegning/" + SelMatnr + ".pdf");
            }


        });
    });
