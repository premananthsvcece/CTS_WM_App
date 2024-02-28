sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/odata/v2/ODataModel'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, ODataModel) {
        "use strict";

        return Controller.extend("sap.pp.wcare.wmd.workmanagerapp.controller.Initial_01", {
            onInit: function () {
                var that = this;
                that.showBusyIndicator();
                var Plant = " ";
                var Workcenter = " ";
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
                                try {
                                    console.log(oData);
                                    // Future
                                    if (oData.results.length === 1) {
                                        var Plant = oData.results[0].Data01;
                                        var Workcenter = oData.results[0].Data02;
                                        var Path = that.getView().getId();
                                        sap.ui.getCore().byId(Path + "--idInputPlant").setSelectedKey(Plant);
                                        sap.ui.getCore().byId(Path + "--idInputWorkCenter").setSelectedKey(Workcenter);;
                                        that.hideBusyIndicator();
                                    }
                                } catch (e) {
                                    alert(e.message);
                                }
                            },

                        });
                if (Plant != " ") {
                    that.onLoadData(Plant, Workcenter);
                }
                that.hideBusyIndicator();
            },
            onLoadData: function (Plant, Workcenter) {
                var othis = this;

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

                                // In Progress
                                var InProgressData = oData.NavWC_InProgress.results;
                                var InProgressModel = new sap.ui.model.json.JSONModel();
                                var Path = othis.getView().getId();

                                InProgressModel.setData({
                                    "InProgressData": InProgressData
                                });
                                var InProgressTable = sap.ui.getCore().byId(Path + "--idInprogressOrderList");

                                InProgressTable.setModel(
                                    InProgressModel,
                                    'InProgressModel');

                                // Queue
                                var InQueueData = oData.NavWC_Queue.results;
                                var InQueueModel = new sap.ui.model.json.JSONModel();

                                InQueueModel.setData({
                                    "InQueueData": InQueueData
                                });
                                var InQueueTable = sap.ui.getCore().byId(Path + "--idQueueOrderList");

                                InQueueTable.setModel(
                                    InQueueModel,
                                    'InQueueModel');

                                // Future
                                var InFutureData = oData.NavWC_Future.results;
                                var InFutureModel = new sap.ui.model.json.JSONModel();

                                InFutureModel.setData({
                                    "InFutureData": InFutureData
                                });
                                var InFutureTable = sap.ui.getCore().byId(Path + "--idFutureOrderList");

                                InFutureTable.setModel(
                                    InFutureModel,
                                    'InFutureModel');

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
                var Path = that.getView().getId();
                var Plant = sap.ui.getCore().byId(Path + "--idInputPlant").getSelectedItem();
                var Workcenter = sap.ui.getCore().byId(Path + "--idInputWorkCenter").getSelectedItem();
                that.onLoadData(Plant, Workcenter);
            },

            onValueHelpRequested: function () {

            },
            _onPlantHelp: function (oEvent) {
                var that = this;
                var Path = that.getView().getId();
                var SelPlant = sap.ui.getCore().byId(Path + "--idInputPlant").getSelectedItem();
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
            _onWorkCenterHelp: function (oEvent) {
                var that = this;
                var Path = that.getView().getId();
                var SelPlant = sap.ui.getCore().byId(`${Path}--idInputPlant`).getSelectedItem();
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
                var Path = that.getView().getId();
                var SelAufnr = sap.ui.getCore().byId(`${Path}--idInputPlant`).getSelectedItem();
                if (SelAufnr === null) {
                    SelAufnr = "MQTC";
                }
                if (!that.BOMDialog) {
                    that.BOMDialog = sap.ui.xmlfragment(
                        "sap.pp.wcare.wmd.workmanagerapp.Fragments.HelpWorkCenter", that);
                    that.getView().addDependent(
                        that.BOMDialog);
                }
                // open value help dialog
                that.BOMDialog.open();
                var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
                var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

                oModel
                    .read(
                        "/ValueHelpSet?$filter=Key01 eq 'BOM' and key02 eq '" + SelAufnr + "'",
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

                                    WorkCenterTable.setModel(
                                        BOMModel,
                                        'BOMModel');
                                } catch (e) {
                                    alert(e.message);
                                }
                            },

                        });
            },
            onButtonPress: function (oEVent) {

            }
        });
    });
