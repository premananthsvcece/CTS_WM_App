sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/ProgressIndicator",
    "sap/ui/model/type/Date",
    "sap/m/PDFViewer",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    MessageBox,
    MessageToast,
    Filter,
    FilterOperator,
    ProgressIndicator,
    Dates,
    PDFViewer
  ) {
    "use strict";

    return Controller.extend(
      "sap.pp.wcare.wmd.workmanagerapp.controller.Initial_01",
      {
        onInit: function () {
          var that = this;
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
          oModel.read("/ValueHelpSet?$filter=Key01 eq 'Default'", {
            context: null,
            urlParameters: null,
            async: false,
            success: function (oData, oResponse) {
              // that.showBusyIndicator();
              try {
                // Future
                if (oData.results.length === 1) {
                  var Plant = oData.results[0].Data01;
                  var Workcenter = oData.results[0].Data02;
                  var SelWCGrp;
                  var Path = that.getView().getId();
                  sap.ui
                    .getCore()
                    .byId(Path + "--idInputPlant")
                    .setValue(Plant);

                  sap.ui
                    .getCore()
                    .byId(Path + "--idTextPlant")
                    .setText(Plant);

                  sap.ui
                    .getCore()
                    .byId(Path + "--idInputWorkCenter")
                    .setValue(Workcenter);

                  sap.ui
                    .getCore()
                    .byId(Path + "--idTextWorkCenter")
                    .setText(Workcenter);

                  if (Plant != " ") {
                    that.onLoadData(that, Plant, SelWCGrp, Workcenter);
                  }
                  // that.hideBusyIndicator();
                }
              } catch (e) {
                that.hideBusyIndicator();
                alert(e.message);
              }
            },
          });
        },
        onAfterRendering: function () {
          var that = this;
          var i = 1;
          var Path = that.getView().getId();
          var ProgressIndicator = sap.ui
            .getCore()
            .byId(Path + "--_IDGenProgressIndicator1");
          setInterval(function () {
            i = i + 1;
            ProgressIndicator.setPercentValue(i + "%");
            ProgressIndicator.setDisplayValue("Refresh Progress: " + i + " %");
            if (i === 100) {
              i = 1;
              var Plant = sap.ui
                .getCore()
                .byId(Path + "--idInputPlant")
                .getValue();
              var Workcenter = sap.ui
                .getCore()
                .byId(Path + "--idInputWorkCenter")
                .getValue();
              var SelWCGrp = sap.ui
                .getCore()
                .byId(`${Path}--idInputWorkArea`)
                .getValue();

              that.onLoadData(that, Plant, SelWCGrp, Workcenter);
            }
          }, 1000);
        },
        onLoadData: function (that, Plant, SelWCGrp, Workcenter) {
          var othis = that;

          othis.showBusyIndicator();
          var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
          var IEntry = {};
          IEntry.Key01 = "READ";
          IEntry.Key02 = Plant;
          IEntry.Key03 = Workcenter;
          IEntry.Key04 = SelWCGrp;
          IEntry.Key05 = " ";
          IEntry.WorkCenterArea = " ";
          IEntry.NavWC_InProgress = [{}];
          IEntry.NavWC_Queue = [{}];
          IEntry.NavWC_Future = [{}];

          // console.log(IEntry);
          oDataModel.create(
            "/WorkCenter_AreaOrderSet",
            IEntry,
            null,
            function (oData, Response) {
              try {
                // console.log(oData);
                othis.hideBusyIndicator();
                var Path = othis.getView().getId();
                // In Progress
                var InProgressData = oData.NavWC_InProgress.results;
                if (InProgressData.length === 0) {
                  // InProgressData = [{}]; Do Nothing
                }
                var InProgressModel = new sap.ui.model.json.JSONModel();

                InProgressModel.setData({
                  InProgressData: InProgressData,
                });
                var InProgressTable = sap.ui
                  .getCore()
                  .byId(Path + "--idInprogressOrderList");

                InProgressTable.setModel(InProgressModel, "InProgressModel");
                // }
                // Queue
                var InQueueData = oData.NavWC_Queue.results;
                if (InQueueData.length === 0) {
                  // InQueueData = [{}]; Do Nothing
                }
                var InQueueModel = new sap.ui.model.json.JSONModel();

                InQueueModel.setData({
                  InQueueData: InQueueData,
                });
                var InQueueTable = sap.ui
                  .getCore()
                  .byId(Path + "--idQueueOrderList");

                InQueueTable.setModel(InQueueModel, "InQueueModel");
                // }
                // Future
                var InFutureData = oData.NavWC_Future.results;
                if (InFutureData.length === 0) {
                  // InFutureData = [{}]; Do Nothing
                }
                var InFutureModel = new sap.ui.model.json.JSONModel();

                InFutureModel.setData({
                  InFutureData: InFutureData,
                });
                var InFutureTable = sap.ui
                  .getCore()
                  .byId(Path + "--idFutureOrderList");

                InFutureTable.setModel(InFutureModel, "InFutureModel");
                // }
              } catch (e) {
                alert(e.message);
                othis.hideBusyIndicator();
              }
            }
          );
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
          var Plant = sap.ui
            .getCore()
            .byId(Path + "--idInputPlant")
            .getValue();
          var Workcenter = sap.ui
            .getCore()
            .byId(Path + "--idInputWorkCenter")
            .getValue();
          var SelWCGrp = sap.ui
            .getCore()
            .byId(`${Path}--idInputWorkArea`)
            .getValue();

          that.onLoadData(that, Plant, SelWCGrp, Workcenter);
        },

        onValueHelpRequested: function () {},
        _onPlantHelp: function (oEvent) {
          var that = this;
          var Path = that.getView().getId();
          var SelPlant = sap.ui
            .getCore()
            .byId(Path + "--idInputPlant")
            .getValue();
          if (SelPlant === null) {
            SelPlant = "DKKV";
          }
          if (!that.PlantDialog) {
            that.PlantDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.HelpPlant",
              that
            );
            that.getView().addDependent(that.PlantDialog);
          }
          // open value help dialog
          that.PlantDialog.open();
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
          var oJsonModel = new sap.ui.model.json.JSONModel();
          // ?$filter=Werks eq '" + SelPlant + "'
          oModel.read("/ZshWerksSet", {
            context: null,
            urlParameters: null,
            success: function (oData, oResponse) {
              try {
                // console.log(oData);
                // Future
                var Path = that.getView().getId();
                var PlantData = oData.results;
                var PlantModel = new sap.ui.model.json.JSONModel();

                PlantModel.setData({
                  PlantData: PlantData,
                });
                var PlantTable = sap.ui.getCore().byId("idPlantDialog");

                PlantTable.setModel(PlantModel, "PlantModel");
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
              sap.ui.getCore().byId(`${Path}--idTextPlant`).setText(Plant);
              oEvent.getSource().getBinding("items").filter([]);
            } else {
              // Raise Message
              // MessageBox.information("Select any line to view BOM Details for the Production Order.");
              return;
            }
          }
        },

        _onWorkCenterHelp: function (oEvent) {
          var that = this;
          var Path = that.getView().getId();

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          if (SelPlant === null) {
            SelPlant = "DKKV";
          }

          var SelWCGrp = sap.ui
            .getCore()
            .byId(`${Path}--idInputWorkArea`)
            .getValue();

          if (!that.WCDialog) {
            that.WCDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.HelpWorkCenter",
              that
            );
            that.getView().addDependent(that.WCDialog);
          }
          // open value help dialog
          that.WCDialog.open();
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'WorkCenter' and Key04 eq '" +
              SelPlant +
              "' and Key05 eq '" +
              SelWCGrp +
              "'",
            {
              context: null,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  // console.log(oData);
                  // Future
                  var Path = that.getView().getId();
                  var WorkCenterData = oData.results;
                  var WorkCenterModel = new sap.ui.model.json.JSONModel();

                  WorkCenterModel.setData({
                    WorkCenterData: WorkCenterData,
                  });
                  var WorkCenterTable = sap.ui
                    .getCore()
                    .byId("idWorkCenterDialog");

                  WorkCenterTable.setModel(WorkCenterModel, "WorkCenterModel");
                } catch (e) {
                  alert(e.message);
                }
              },
            }
          );
        },
        _onWorkAreaHelp: function () {
          var that = this;
          var Path = that.getView().getId();
          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          if (SelPlant === null) {
            SelPlant = "DKKV";
          }
          if (!that.WAreaDialog) {
            that.WAreaDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.HelpWorkArea",
              that
            );
            that.getView().addDependent(that.WAreaDialog);
          }
          // open value help dialog
          that.WAreaDialog.open();
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'WCGroup' and Key04 eq '" +
              SelPlant +
              "'",
            {
              context: null,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  // console.log(oData);
                  // Future
                  var Path = that.getView().getId();
                  var WorkAreaData = oData.results;
                  var WorkAreaModel = new sap.ui.model.json.JSONModel();

                  WorkAreaModel.setData({
                    WorkAreaData: WorkAreaData,
                  });
                  var WorkAreaTable = sap.ui.getCore().byId("idWorkAreaDialog");

                  WorkAreaTable.setModel(WorkAreaModel, "WorkAreaModel");
                } catch (e) {
                  alert(e.message);
                }
              },
            }
          );
        },
        onBOMPressed: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();
          var TabsArray = sap.ui
            .getCore()
            .byId(`${Path}--ObjectPageLayout`)
            .getSections(); // All Tab Details
          var TabSelect = sap.ui
            .getCore()
            .byId(`${Path}--ObjectPageLayout`)
            .getSelectedSection(); // Selected Tab Details
          for (var i = 0; i < TabsArray.length; i++) {
            if (TabSelect === TabsArray[i].sId) {
              index = i; // Getting Selected Tab validating Id
              break;
            }
          }
          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            index = 0;
            SelAufnr = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data02;
            SelOprNo = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data05;
          }

          if (Tableindex === undefined) {
            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getSelectedIndices()[0];
            // Get Order No & Opr No
            if (Tableindex != undefined) {
              index = 1;
              SelAufnr = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data02;
              SelOprNo = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data05;
            }
          }
          if (Tableindex === undefined) {
            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idFutureOrderList`)
              .getSelectedIndices()[0];
            // Get Order No & Opr No
            if (Tableindex != undefined) {
              index = 2;
              SelAufnr = sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .getModel("InFutureModel")
                .getData().InFutureData[Tableindex].Data02;
              SelOprNo = sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .getModel("InFutureModel")
                .getData().InFutureData[Tableindex].Data05;
            }
          }
          if (Tableindex === undefined) {
            // Raise Message
            MessageBox.information(
              "Select any line to view BOM Details for the Production Order."
            );
            return;
          }
          if (!that.BOMDialog) {
            that.BOMDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.BOM",
              that
            );
            that.getView().addDependent(that.BOMDialog);
          }
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'BOM' and Key02 eq '" +
              SelAufnr +
              "' and Key03 eq '" +
              SelOprNo +
              "'",
            {
              context: null,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  // console.log(oData);
                  // Future
                  var Path = that.getView().getId();
                  var BOMData = oData.results;
                  var BOMModel = new sap.ui.model.json.JSONModel();

                  BOMModel.setData({
                    BOMData: BOMData,
                  });
                  var BOMTable = sap.ui.getCore().byId("idBOMDialog");

                  BOMTable.setModel(BOMModel, "BOMModel");
                  // open value help dialog
                  that.BOMDialog.open();
                } catch (e) {
                  alert(e.message);
                }
              },
            }
          );
        },
        onRoutePressed: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();
          var TabsArray = sap.ui
            .getCore()
            .byId(`${Path}--ObjectPageLayout`)
            .getSections(); // All Tab Details
          var TabSelect = sap.ui
            .getCore()
            .byId(`${Path}--ObjectPageLayout`)
            .getSelectedSection(); // Selected Tab Details
          for (var i = 0; i < TabsArray.length; i++) {
            if (TabSelect === TabsArray[i].sId) {
              index = i; // Getting Selected Tab validating Id
              break;
            }
          }
          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            index = 0;
            SelAufnr = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data02;
            SelOprNo = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data05;
          }
          if (Tableindex === undefined) {
            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getSelectedIndices()[0];
            // Get Order No & Opr No
            if (Tableindex != undefined) {
              index = 1;
              SelAufnr = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data02;
              SelOprNo = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data05;
            }
          }
          if (Tableindex === undefined) {
            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idFutureOrderList`)
              .getSelectedIndices()[0];
            // Get Order No & Opr No
            if (Tableindex != undefined) {
              index = 2;
              SelAufnr = sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .getModel("InFutureModel")
                .getData().InFutureData[Tableindex].Data02;
              SelOprNo = sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .getModel("InFutureModel")
                .getData().InFutureData[Tableindex].Data05;
            }
          }
          if (Tableindex === undefined) {
            // Raise Message
            MessageBox.information(
              "Select any line to view BOM Details for the Production Order."
            );
            return;
          }
          if (!that.RouteDialog) {
            that.RouteDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.Routing",
              that
            );
            that.getView().addDependent(that.RouteDialog);
          }
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'Routing' and Key02 eq '" +
              SelAufnr +
              "' and Key03 eq '" +
              SelOprNo +
              "'",
            {
              context: null,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  // console.log(oData);
                  // Future
                  var Path = that.getView().getId();
                  var RoutingData = oData.results;
                  var RoutingModel = new sap.ui.model.json.JSONModel();

                  RoutingModel.setData({
                    RoutingData: RoutingData,
                  });
                  var RoutingTable = sap.ui.getCore().byId("idRoutingDialog");

                  RoutingTable.setModel(RoutingModel, "RoutingModel");
                  // open value help dialog
                  that.RouteDialog.open();
                } catch (e) {
                  alert(e.message);
                }
              },
            }
          );
        },
        _onWorkCenterSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter("Data01", FilterOperator.Contains, sValue);
          var oBinding = oEvent.getParameter("itemsBinding");
          oBinding.filter([oFilter]);
        },
        _onWorkAreaSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter("Data01", FilterOperator.Contains, sValue);
          var oBinding = oEvent.getParameter("itemsBinding");
          oBinding.filter([oFilter]);
        },

        _WorkCenterSelect: function (oEvent) {
          if (oEvent.getParameters().selectedItems != undefined) {
            var Workcenter = oEvent.getParameters().selectedItems[0].getTitle();
            if (Workcenter != undefined) {
              var Path = this.getView().getId();
              sap.ui
                .getCore()
                .byId(`${Path}--idInputWorkCenter`)
                .setValue(Workcenter);

              sap.ui
                .getCore()
                .byId(`${Path}--idTextWorkCenter`)
                .setText(Workcenter);

              oEvent.getSource().getBinding("items").filter([]);
            } else {
              return;
            }
            this.onButtonPress();
          }
        },
        _WorkAreaSelect: function (oEvent) {
          if (oEvent.getParameters().selectedItems != undefined) {
            var Workcenter = oEvent.getParameters().selectedItems[0].getTitle();
            if (Workcenter != undefined) {
              var Path = this.getView().getId();
              sap.ui
                .getCore()
                .byId(`${Path}--idInputWorkArea`)
                .setValue(Workcenter);

                sap.ui
                .getCore()
                .byId(`${Path}--idTextWorkArea`)
                .setText(Workcenter);

              oEvent.getSource().getBinding("items").filter([]);
            } else {
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
          var TabsArray = sap.ui
            .getCore()
            .byId(`${Path}--ObjectPageLayout`)
            .getSections(); // All Tab Details
          var TabSelect = sap.ui
            .getCore()
            .byId(`${Path}--ObjectPageLayout`)
            .getSelectedSection(); // Selected Tab Details
          for (var i = 0; i < TabsArray.length; i++) {
            if (TabSelect === TabsArray[i].sId) {
              index = i; // Getting Selected Tab validating Id
              break;
            }
          }
          var Tableindex = "X";
          var SelMatnr = " ";
          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Material
          if (Tableindex != undefined) {
            index = 0;
            SelMatnr = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data03;
          }
          if (Tableindex === undefined) {
            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getSelectedIndices()[0];
            // Get Material
            if (Tableindex != undefined) {
              index = 1;
              SelMatnr = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data03;
            }
          }
          if (Tableindex === undefined) {
            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idFutureOrderList`)
              .getSelectedIndices()[0];
            // Get Material
            if (Tableindex != undefined) {
              index = 2;
              SelMatnr = sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .getModel("InFutureModel")
                .getData().InFutureData[Tableindex].Data03;
            }
          }
          if (Tableindex === undefined) {
            // Raise Message
            MessageBox.information(
              "Select any line to view Drawing Details for the Material."
            );
            return;
          }

          if (!that.DrawingDialog) {
            that.DrawingDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.PopupPDF",
              that
            );
            that.getView().addDependent(that.DrawingDialog);
          }

          // Get the path to the Windows shared folder
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'DrawingURl' and Key02 eq '" +
              SelMatnr +
              "'",
            {
              context: null,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  if (oData.results.length != 0) {
                    var DrawingURl = oData.results[0];
                    that.DrawingDialog.open();
                    var oHtml = sap.ui.getCore().byId("DiagramPDF");
                    oHtml.setContent(
                      "<iframe src='" +
                        DrawingURl +
                        "' height='1700' width='1300'></iframe>"
                    );

                    // window.open("http://" + DrawingURl.Data01),
                    // "_Drawing_Output";
                  }
                } catch (e) {
                  alert(e.message);
                }
              },
            }
          );
        },

        onOrderNotePressed: function (oEvent) {
          MessageBox.information("Enablement is coming soon");
          return;
        },

        onPalLabelPressed: function (oEvent) {
          MessageBox.information("Enablement is coming soon");
          return;
        },

        onStartPressed: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();
          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            SelAufnr = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data02;
            SelOprNo = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data05;
          } else {
            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getSelectedIndices()[0];
            // Get Order No & Opr No
            if (Tableindex != undefined) {
              SelAufnr = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data02;
              SelOprNo = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data05;
            } else {
              // Raise Message
              MessageBox.error(
                "Select Only Lines from In Progress and In Queue section to Proceed"
              );
              return;
            }
          }
          if (Tableindex === undefined) {
            // Raise Message
            MessageBox.error(
              "Select Only Lines from In Progress and In Queue section to Proceed"
            );
            return;
          }

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          that.showBusyIndicator(1000, 0);

          if (!that.StartDialog) {
            that.StartDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.StartAction",
              that
            );
            that.getView().addDependent(that.StartDialog);
          }

          // open value help dialog
          that.StartDialog.open();

          var oDateTime = new Date();
          if (oDateTime.getMonth() < 10) {
            var Month = "0" + (oDateTime.getMonth() + 1);
          }
          if (oDateTime.getMonth() > 9) {
            var Month = oDateTime.getMonth() + 1;
          }
          if (oDateTime.getDate() < 10) {
            var Day = "0" + oDateTime.getDate();
          }
          if (oDateTime.getDate() > 9) {
            var Day = oDateTime.getDate();
          }
          var Year = oDateTime.getFullYear();
          var oDateFormat = Year + Month + Day; // Day + "/" + Month + "/" + Year;

          var hr = oDateTime.getHours().toString();
          var mm = oDateTime.getMinutes().toString();
          var sec = oDateTime.getSeconds().toString();
          var oTimeFormat = hr + mm + sec;

          sap.ui.getCore().byId("idStartDate").setValue(oDateFormat);
          sap.ui.getCore().byId("idStartTime").setValue(oTimeFormat);
          sap.ui.getCore().byId("idSelectStartPlant").setValue(SelPlant);

          that.hideBusyIndicator();
        },

        onStartQueuePressed: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();
          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idQueueOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            SelAufnr = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getModel("InQueueModel")
              .getData().InQueueData[Tableindex].Data02;
            SelOprNo = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getModel("InQueueModel")
              .getData().InQueueData[Tableindex].Data05;
          } else {
            // Raise Message
            MessageBox.error(
              "Select Only Lines from In Progress and In Queue section to Proceed"
            );
            return;
          }

          if (Tableindex === undefined) {
            // Raise Message
            MessageBox.error(
              "Select Only Lines from In Progress and In Queue section to Proceed"
            );
            return;
          }

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          that.showBusyIndicator(1000, 0);

          if (!that.StartDialog) {
            that.StartDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.StartAction",
              that
            );
            that.getView().addDependent(that.StartDialog);
          }

          // open value help dialog
          that.StartDialog.open();

          var oDateTime = new Date();
          if (oDateTime.getMonth() < 10) {
            var Month = "0" + (oDateTime.getMonth() + 1);
          }
          if (oDateTime.getMonth() > 9) {
            var Month = oDateTime.getMonth() + 1;
          }
          if (oDateTime.getDate() < 10) {
            var Day = "0" + oDateTime.getDate();
          }
          if (oDateTime.getDate() > 9) {
            var Day = oDateTime.getDate();
          }
          var Year = oDateTime.getFullYear();
          var oDateFormat = Year + Month + Day; // Day + "/" + Month + "/" + Year;

          var hr = oDateTime.getHours().toString();
          var mm = oDateTime.getMinutes().toString();
          var sec = oDateTime.getSeconds().toString();
          var oTimeFormat = hr + mm + sec;

          sap.ui.getCore().byId("idStartDate").setValue(oDateFormat);
          sap.ui.getCore().byId("idStartTime").setValue(oTimeFormat);
          sap.ui.getCore().byId("idSelectStartPlant").setValue(SelPlant);

          that.hideBusyIndicator();
        },

        OnOperatorfill: function (oEvent) {
          var that = this;
          var sValue = oEvent.getParameter("value");
          var Path = that.getView().getId();
          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'OperatorNo' and Key02 eq '" +
              sValue +
              "' and Key03 eq '" +
              SelPlant +
              "'",
            {
              context: null,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  var sPath = that.getView().getId();
                  if (oData.results.length != 0) {
                    var emparray = oData.results[0];
                    sap.ui
                      .getCore()
                      .byId(`idStartFName`)
                      .setValue(emparray.Data03);
                    sap.ui
                      .getCore()
                      .byId(`idStartLName`)
                      .setValue(emparray.Data04);
                  }
                } catch (e) {
                  alert(e.message);
                }
              },
            }
          );
        },
        onConfirmStartPress: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var OperatorNo = sap.ui.getCore().byId("idStartOperator").getValue();
          var FirstName = sap.ui.getCore().byId("idStartFName").getValue();
          var LastName = sap.ui.getCore().byId("idStartLName").getValue();
          var StartDate = sap.ui.getCore().byId("idStartDate").getValue();
          var StartTime = sap.ui.getCore().byId("idStartTime").getValue();

          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            index = 0;
            SelAufnr = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data02;
            SelOprNo = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data05;
          } else {
            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getSelectedIndices()[0];
            // Get Order No & Opr No
            if (Tableindex != undefined) {
              index = 1;
              SelAufnr = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data02;
              SelOprNo = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data05;
            } else {
              // Raise Message
              MessageBox.error(
                "Select Only Lines from In Progress and In Queue section to Proceed"
              );
              return;
            }
          }

          if (Tableindex === undefined) {
            // Raise Message
            MessageBox.error(
              "Select Only Lines from In Progress and In Queue section to Proceed"
            );
            return;
          }

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          that.showBusyIndicator(1000, 0);

          var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
          var IEntry = {};
          IEntry.Key01 = "START";
          IEntry.Key02 = SelAufnr;
          IEntry.Key03 = SelOprNo;
          IEntry.Key04 = SelPlant;
          IEntry.Key05 = OperatorNo;
          IEntry.WorkCenterArea = " ";
          if (index === 0) {
            IEntry.NavWC_InProgress = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData;
            for (var ind = 0; ind < IEntry.NavWC_InProgress.length; ind++) {
              if (ind === Tableindex) {
                IEntry.NavWC_InProgress[ind].Data16 = OperatorNo;
                IEntry.NavWC_InProgress[ind].Data17 = "Success";
                IEntry.NavWC_InProgress[ind].Data14 = StartDate;
                IEntry.NavWC_InProgress[ind].Data15 = StartTime;
              }
            }
            sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .setData("InProgressData", IEntry.NavWC_InProgress);

            IEntry.NavWC_Queue = [{}];
          }
          if (index === 1) {
            IEntry.NavWC_Queue = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getModel("InQueueModel")
              .getData().InQueueData;

            for (var ind = 0; ind < IEntry.NavWC_Queue.length; ind++) {
              if (ind === Tableindex) {
                IEntry.NavWC_Queue[ind].Data16 = OperatorNo;
                IEntry.NavWC_Queue[ind].Data14 = StartDate;
                IEntry.NavWC_Queue[ind].Data15 = StartTime;
              }
            }
            sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getModel("InQueueModel")
              .setData("InQueueData", IEntry.NavWC_Queue);

            IEntry.NavWC_InProgress = [{}];
          }

          IEntry.NavWC_Future = [{}];
          that.StartDialog.close();

          console.log(IEntry);
          oDataModel.create(
            "/WorkCenter_AreaOrderSet",
            IEntry,
            null,
            function (oData, Response) {
              try {
                // console.log(oData);
                that.hideBusyIndicator();
                that.onButtonPress();
                MessageBox.confirm("Update Successful");
                return;
              } catch (e) {
                alert(e.message);
                that.hideBusyIndicator();
              }
            }
          );
        },
        onCancelStartPress: function () {
          this.StartDialog.close();
          MessageBox.confirm("No Update Performed");
        },
        onStopPressed: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";
          var SelOpratorNo = " ";
          var SelStartDate = " ";
          var SelStartTime = " ";

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            SelAufnr = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data02;
            SelOprNo = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data05;

            SelOpratorNo = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data16;

            SelStartDate = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data14;

            SelStartTime = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data15;
          }
          if (Tableindex === undefined) {
            // Raise Message
            MessageBox.error(
              "Select Only Lines from In Progress section to Stop Operation"
            );
            return;
          }

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          that.showBusyIndicator(100, 0);

          if (!that.StopDialog) {
            that.StopDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.StopAction",
              that
            );
            that.getView().addDependent(that.StopDialog);
          }

          // open value help dialog
          that.StopDialog.open();

          var oDateTime = new Date();

          if (oDateTime.getMonth() < 10) {
            var Month = "0" + (oDateTime.getMonth() + 1);
          }
          if (oDateTime.getMonth() > 9) {
            var Month = oDateTime.getMonth() + 1;
          }
          if (oDateTime.getDate() < 10) {
            var Day = "0" + oDateTime.getDate();
          }
          if (oDateTime.getDate() > 9) {
            var Day = oDateTime.getDate();
          }
          var Year = oDateTime.getFullYear();
          var oDateFormat = Year + Month + Day; // Day + "/" + Month + "/" + Year;

          var hr = oDateTime.getHours().toString();
          var mm = oDateTime.getMinutes().toString();
          var sec = +oDateTime.getSeconds().toString();
          var oTimeFormat = hr + mm + sec;

          sap.ui.getCore().byId("idStartEndDate").setValue(SelStartDate);
          sap.ui.getCore().byId("idStartEndTime").setValue(SelStartTime);
          sap.ui.getCore().byId("idStopEndDate").setValue(oDateFormat);
          sap.ui.getCore().byId("idStopEndTime").setValue(oTimeFormat);
          sap.ui.getCore().byId("idSelectStopPlant").setValue(SelPlant);
          sap.ui.getCore().byId("idStopOperator").setValue(SelOpratorNo);
          that.OnStopOperatorGet(SelOpratorNo);
          that.hideBusyIndicator();
        },

        OnStopOperatorGet: function (SelOpratorNo) {
          var that = this;
          var sValue = SelOpratorNo;
          var Path = that.getView().getId();
          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'OperatorNo' and Key02 eq '" +
              sValue +
              "' and Key03 eq '" +
              SelPlant +
              "'",
            {
              context: null,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  var sPath = that.getView().getId();
                  if (oData.results.length != 0) {
                    var emparray = oData.results[0];
                    sap.ui
                      .getCore()
                      .byId(`idStopFName`)
                      .setValue(emparray.Data03);
                    sap.ui
                      .getCore()
                      .byId(`idStopLName`)
                      .setValue(emparray.Data04);
                  }
                } catch (e) {
                  alert(e.message);
                }
              },
            }
          );
        },
        onConfirmStopPress: function () {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var OperatorNo = sap.ui.getCore().byId("idStopOperator").getValue();
          var FirstName = sap.ui.getCore().byId("idStopFName").getValue();
          var LastName = sap.ui.getCore().byId("idStopLName").getValue();
          var EndDate = sap.ui.getCore().byId("idStopEndDate").getValue();
          var EndTime = sap.ui.getCore().byId("idStopEndTime").getValue();

          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            index = 0;
            SelAufnr = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data02;
            SelOprNo = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data05;
          }
          if (Tableindex === undefined) {
            // Raise Message
            MessageBox.error(
              "Select Only Lines from In Progress section to Stop Operation"
            );
            return;
          }

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          that.showBusyIndicator(1000, 0);

          var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
          var IEntry = {};
          IEntry.Key01 = "STOP";
          IEntry.Key02 = SelAufnr;
          IEntry.Key03 = SelOprNo;
          IEntry.Key04 = SelPlant;
          IEntry.Key05 = OperatorNo;
          IEntry.WorkCenterArea = " ";
          if (index === 0) {
            IEntry.NavWC_InProgress = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData;
            for (var ind = 0; ind < IEntry.NavWC_InProgress.length; ind++) {
              if (ind === Tableindex) {
                IEntry.NavWC_InProgress[ind].Data08 = EndDate;
                IEntry.NavWC_InProgress[ind].Data09 = EndTime;
              }
            }
            sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .setData("InProgressData", IEntry.NavWC_InProgress);
          }

          IEntry.NavWC_Queue = [{}];
          IEntry.NavWC_Future = [{}];
          that.StopDialog.close();

          console.log(IEntry);
          oDataModel.create(
            "/WorkCenter_AreaOrderSet",
            IEntry,
            null,
            function (oData, Response) {
              try {
                // console.log(oData);
                that.hideBusyIndicator();
                that.onButtonPress();
                MessageBox.confirm("Update Successful");
                return;
              } catch (e) {
                alert(e.message);
                that.hideBusyIndicator();
              }
            }
          );
        },
        onCancelStopPress: function () {
          this.StopDialog.close();
          MessageBox.confirm("No Update Performed");
        },
        onOrderNotePressed: function () {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            index = 0;
            SelAufnr = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data02;
            SelOprNo = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data05;
          }
          if (Tableindex === undefined) {
            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getSelectedIndices()[0];
            // Get Order No & Opr No
            if (Tableindex != undefined) {
              index = 0;
              SelAufnr = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data02;
              SelOprNo = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data05;
            }
          }
          if (Tableindex === undefined) {
            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idFutureOrderList`)
              .getSelectedIndices()[0];
            // Get Order No & Opr No
            if (Tableindex != undefined) {
              index = 0;
              SelAufnr = sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .getModel("InFutureModel")
                .getData().InFutureData[Tableindex].Data02;
              SelOprNo = sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .getModel("InFutureModel")
                .getData().InFutureData[Tableindex].Data05;
            }
          }
          if (Tableindex === undefined) {
            // Raise Message
            MessageBox.error("Select Only Lines for displaying order notes");
            return;
          }
          if (!that.TextBoxDialog) {
            that.TextBoxDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.TextBox",
              that
            );
            that.getView().addDependent(that.TextBoxDialog);
          }

          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'HeaderText' and Key02 eq '" +
              SelAufnr +
              "'",
            {
              context: null,
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  if (oData.results.length != 0) {
                    var LongText = oData.results[0];
                    sap.ui
                      .getCore()
                      .byId(`idHeaderText`)
                      .setValue(LongText.Data01);
                  }
                } catch (e) {
                  alert(e.message);
                }
              },
            }
          );

          // open value help dialog
          that.TextBoxDialog.open();
        },
        onConfirmTextPress: function (oEvent) {
          MessageBox.information("Update will Happen in Backend");
          var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
          var Data01 = sap.ui.getCore().byId(`idHeaderText`).getValue();
          var itemset = {
            Data01: Data01,
          };

          var IEntry = [];
          IEntry.PushManager(itemset);
          oDataModel.create(
            "/ValueHelpSet",
            IEntry,
            null,
            function (oData, Response) {
              try {
                // console.log(oData);
                that.hideBusyIndicator();
                that.onButtonPress();
                MessageBox.confirm("Update Successful");
                return;
              } catch (e) {
                alert(e.message);
                that.hideBusyIndicator();
              }
            }
          );
          this.TextBoxDialog.close();
        },
        onCancelTextPress: function () {
          this.TextBoxDialog.close();
        },
        onScrapPressed: function () {
          MessageBox.information("SCARP Activity Development inprogress");
          return;
        },
        onPostPressed: function () {
          MessageBox.information("POST Activity Development inprogress");
          return;
        },
        onTableRowSelectionChange: function () {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var StartDate;
          var EndDate;

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            index = 0;
            StartDate = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data14;

            EndDate = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data08;

            if (StartDate != "") {
              if (EndDate != "") {
                sap.ui
                  .getCore()
                  .byId(`${Path}--idINPStopJob`)
                  .setEnabled(false);
                sap.ui
                  .getCore()
                  .byId(`${Path}--idINPStartJob`)
                  .setEnabled(true);
              } else {
                sap.ui
                  .getCore()
                  .byId(`${Path}--idINPStartJob`)
                  .setEnabled(false);
                sap.ui.getCore().byId(`${Path}--idINPStopJob`).setEnabled(true);
              }
            }
          }
          if (Tableindex === undefined) {
            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getSelectedIndices()[0];
            // Get Order No & Opr No
            if (Tableindex != undefined) {
              index = 0;
              StartDate = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data14;
            }
          }
          if (Tableindex === undefined) {
            // Raise Message
            MessageBox.error("Select Only Lines for displaying order notes");
            return;
          }
        },
      }
    );
  }
);
