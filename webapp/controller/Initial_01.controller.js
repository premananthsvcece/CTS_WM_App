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
                var othis = this;

                othis.showBusyIndicator();npm
                var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
                var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
                var IEntry = {};
                IEntry.Key01 = "READ";
                IEntry.Key02 = " ";
                IEntry.Key03 = " ";
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

                                InProgressModel.setData({
                                    "InProgressData": InProgressData
                                });
                                var InProgressTable = sap.ui.getCore().byId("application-sapppwcarewmdworkmanagerapp-display-component---Initial_01--idInprogressOrderList");

                                InProgressTable.setModel(
                                    InProgressModel,
                                    'InProgressModel');

                                // Queue
                                var InQueueData = oData.NavWC_Queue.results;
                                var InQueueModel = new sap.ui.model.json.JSONModel();

                                InQueueModel.setData({
                                    "InQueueData": InQueueData
                                });
                                var InQueueTable = sap.ui.getCore().byId("application-sapppwcarewmdworkmanagerapp-display-component---Initial_01--idQueueOrderList");

                                InQueueTable.setModel(
                                    InQueueModel,
                                    'InQueueModel');

                                // Future
                                var InFutureData = oData.NavWC_Queue.results;
                                var InFutureModel = new sap.ui.model.json.JSONModel();

                                InFutureModel.setData({
                                    "InFutureData": InFutureData
                                });
                                var InFutureTable = sap.ui.getCore().byId("application-sapppwcarewmdworkmanagerapp-display-component---Initial_01--idFutureOrderList");

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
            onValueHelpRequested: function () {

            }
        });
    });


// <smartFilterBar:customData>
//                     <core:CustomData
//                         key="defaultFilterBarExpanded"
//                         value='{"Workcenter": "true"}'
//                     />
//                     <core:CustomData
//                         key="defaultShowAllFilters"
//                         value='{"Workcenter": "true"}'
//                     />
//                 </smartFilterBar:customData>