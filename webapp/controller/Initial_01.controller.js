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
    "sap/ndc/BarcodeScanner",
    "sap/m/p13n/Engine",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/library",
    "sap/m/Text",
    "sap/ui/core/library",
    "sap/ui/core/BusyIndicator",
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
    PDFViewer,
    BarcodeScanner,
    Engine,
    Dialog,
    Button,
    mobileLibrary,
    Text,
    coreLibrary,
    BusyIndicator
  ) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.m.DialogType
    var DialogType = mobileLibrary.DialogType;

    // shortcut for sap.ui.core.ValueState
    var ValueState = coreLibrary.ValueState;

    var sBatchId = "";
    var sMovementId = "";
    var sPrdSupAreaId = "";
    var sReasonCodeId = "";
    var sPostReasonCodeId = ""
    var sBinSelLineId = ""
    var TableMatGlobalId = "";
    var TableBatchGlobalId = "";
    var TableMvtGlobalId = "";
    var TableSAGlobalId = "";
    var TableBinGlobalId = "";
    var TableUOMGlobalId = "";

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
              try {
                if (oData.results.length === 1) {
                  var Plant = oData.results[0].Data01;
                  var PlantName = oData.results[0].Data03;
                  var Workcenter = oData.results[0].Data02;
                  var SelWCGrp = oData.results[0].Data04;
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
                    .byId(Path + "--idTextPlantName")
                    .setText(PlantName);

                  sap.ui
                    .getCore()
                    .byId(Path + "--idInputWorkCenter")
                    .setValue(Workcenter);

                  sap.ui
                    .getCore()
                    .byId(Path + "--idTextWorkCenter")
                    .setText(Workcenter);

                  sap.ui
                    .getCore()
                    .byId(Path + "--idInputWorkArea")
                    .setValue(SelWCGrp);

                  sap.ui
                    .getCore()
                    .byId(Path + "--idTextWorkArea")
                    .setText(SelWCGrp);

                  if (Plant != " ") {
                    that.onLoadData(that, Plant, SelWCGrp, Workcenter);
                  }
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
            if (i === 400) {
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
          }, 10000);

          var PlantName = sap.ui
            .getCore()
            .byId(Path + "--idTextPlantName")
            .getText();

          var Path = that.getView().getId();
          var PROES = sap.ui
            .getCore()
            .byId(Path + "--idPROESTitleExp")
            .getText();
          sap.ui
            .getCore()
            .byId(Path + "--idPROESTitleExp")
            .setText(PROES + " - " + PlantName);
          var PROES = sap.ui
            .getCore()
            .byId(Path + "--idPROESTitleSnap")
            .getText();
          sap.ui
            .getCore()
            .byId(Path + "--idPROESTitleSnap")
            .setText(PROES + " - " + PlantName);
        },
        onLoadData: function (that, Plant, SelWCGrp, Workcenter) {
          var othis = that;
          var Path = that.getView().getId();
          // othis.showPostBusyIndicator();
          if (!othis.oInfoMessageDialog) {
            othis.oInfoMessageDialog = new Dialog({
              type: DialogType.Message,
              state: ValueState.Information,
              content: new Text({ text: "Processing..." }),
            });
          }
          othis.oInfoMessageDialog.open();
          var oGlobalBusyDialog = new sap.m.BusyDialog();
          oGlobalBusyDialog.open();


          // sap.ui
          //     .getCore()
          //     .byId(Path + "--idGO").showBusyIndicator();
          var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
          var OrderNo = sap.ui
            .getCore()
            .byId(Path + "--idInputProdOrdNo")
            .getValue();
          var ComponentNo = sap.ui
            .getCore()
            .byId(Path + "--idInputComponentSelNo")
            .getValue();
          var IEntry = {};
          IEntry.Key01 = "READ";
          IEntry.Key02 = Plant;
          IEntry.Key03 = Workcenter;
          IEntry.Key04 = SelWCGrp;
          IEntry.Key05 = OrderNo;
          IEntry.ConfirmType = ComponentNo;
          IEntry.WorkCenterArea = " ";
          IEntry.NavWC_InProgress = [{}];
          IEntry.NavWC_Queue = [{}];
          IEntry.NavWC_Future = [{}];
          IEntry.NavWC_Component = [{}];

          oDataModel.create(
            "/WorkCenter_AreaOrderSet",
            IEntry,
            null,
            function (oData, Response) {
              try {

                if (oData.Key04 === "E") {
                  oData.NavWC_InProgress.results = [];
                  oData.NavWC_Queue.results = [];
                  oData.NavWC_Future.results = [];
                  var message = oData.Key03;
                  MessageToast.show(message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                }
                // else {
                var Path = othis.getView().getId();
                // In Progress
                var InProgressData = oData.NavWC_InProgress.results;

                var InProgressModel = new sap.ui.model.json.JSONModel();

                InProgressModel.setData({
                  InProgressData: InProgressData,
                });
                var InProgressTable = sap.ui
                  .getCore()
                  .byId(Path + "--idInprogressOrderList");

                var Line = InProgressTable.getSelectedIndex();
                var InProgressArray = {};
                // Get the Selected Line Item Value
                if (InProgressTable.getModel('InProgressModel') != undefined) {
                  var InprogressObject = InProgressTable.getModel('InProgressModel').getData().InProgressData;
                } else {
                  var InprogressObject = undefined;
                }

                InProgressTable.setModel(InProgressModel, "InProgressModel");
                var aIndices = sap.ui
                  .getCore()
                  .byId(`${Path}--idInprogressOrderList`)
                  .getBinding("rows").aIndices;
                if (aIndices.length < Line) {
                  Line = aIndices.length;
                  Line = Line - 1;
                }
                for (var loop = 0; loop in aIndices; loop++) {
                  if (loop === Line) {
                    if (InprogressObject != undefined) {
                      InProgressArray = InprogressObject[loop];
                      // Line = aIndices[loop];
                      break;
                    } else {
                      InProgressArray = undefined;
                    }
                  }
                }
                if (InProgressArray != undefined) {
                  for (var fline = 0; fline in InProgressData; fline++) {
                    if (InProgressData[fline].Data16 === InProgressArray.Data16
                      && InProgressData[fline].Data02 === InProgressArray.Data02
                      && InProgressData[fline].Data05 === InProgressArray.Data05
                    ) {
                      Line = fline;
                      break;
                    }
                  }
                } else {
                  Line = -1;
                }
                if (InProgressData.length === 0) {
                  // Do Nothing
                  Line = -1;
                }
                var oListBinding = InProgressTable.getBinding("rows");
                if (oListBinding) {
                  var Sorting = oListBinding.aSorters;
                  var Filter = oListBinding.aFilters;
                  InProgressTable.getBinding("rows").filter(Filter);
                  InProgressTable.getBinding("rows").sort(Sorting);
                  Line = parseInt(Line);
                  if (Line != NaN && Line != -1) {
                    InProgressTable.setSelectedIndex(Line);
                  }
                }

                // Queue
                var InQueueData = oData.NavWC_Queue.results;
                if (InQueueData.length === 0) {
                  // Do Nothing
                }
                var InQueueModel = new sap.ui.model.json.JSONModel();

                InQueueModel.setData({
                  InQueueData: InQueueData,
                });
                var InQueueTable = sap.ui
                  .getCore()
                  .byId(Path + "--idQueueOrderList");

                InQueueTable.setModel(InQueueModel, "InQueueModel");
                var Line = InQueueTable.getSelectedIndex();
                var aIndices = sap.ui
                  .getCore()
                  .byId(`${Path}--idQueueOrderList`)
                  .getBinding("rows").aIndices;
                for (var loop = 0; loop in aIndices; loop++) {
                  if (loop === Line) {
                    Line = aIndices[loop];
                    break;
                  }
                }

                var oListBinding = InQueueTable.getBinding("rows");
                if (oListBinding) {
                  var Sorting = oListBinding.aSorters;
                  var Filter = oListBinding.aFilters;
                  InQueueTable.getBinding("rows").filter(Filter);
                  InQueueTable.getBinding("rows").sort(Sorting);
                  Line = parseInt(Line);
                  if (Line != NaN && Line != -1) {
                    InQueueTable.setSelectedIndex(Line);
                  }
                }

                // Future
                var InFutureData = oData.NavWC_Future.results;
                if (InFutureData.length === 0) {
                  // Do Nothing
                }
                var InFutureModel = new sap.ui.model.json.JSONModel();

                InFutureModel.setData({
                  InFutureData: InFutureData,
                });
                var InFutureTable = sap.ui
                  .getCore()
                  .byId(Path + "--idFutureOrderList");

                InFutureTable.setModel(InFutureModel, "InFutureModel");
                var Line = InFutureTable.getSelectedIndex();
                var aIndices = sap.ui
                  .getCore()
                  .byId(`${Path}--idFutureOrderList`)
                  .getBinding("rows").aIndices;
                for (var loop = 0; loop in aIndices; loop++) {
                  if (loop === Line) {
                    Line = aIndices[loop];
                    break;
                  }
                }

                var oListBinding = InFutureTable.getBinding("rows");
                if (oListBinding) {
                  var Sorting = oListBinding.aSorters;
                  var Filter = oListBinding.aFilters;
                  InFutureTable.getBinding("rows").filter(Filter);
                  InFutureTable.getBinding("rows").sort(Sorting);
                  Line = parseInt(Line);
                  if (Line != NaN && Line != -1) {
                    InFutureTable.setSelectedIndex(Line);
                  }
                }
                // othis.hidePstBusyIndicator();
                oGlobalBusyDialog.close();
                othis.oInfoMessageDialog.close();
                // }
                // }
              } catch (e) {
                // alert(e.message);
                // MessageBox.error(e.message);
                // othis.hideBusyIndicator();
                // othis.hidePstBusyIndicator();
                oGlobalBusyDialog.close();
                othis.oInfoMessageDialog.close();
                MessageToast.show(e.message);
                $(".sapMMessageToast").addClass("sapMMessageToastSuccess");

              }
            }
          );

          // sap.ui
          //     .getCore()
          //     .byId(Path + "--idGO").hideBusyIndicator();

          // var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          // var oPlantModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          // oPlantModel.read("/ZshWerksSet", {
          //   context: null,
          //   async: false,
          //   urlParameters: null,
          //   success: function (oData, oResponse) {
          //     try {
          //       var Path = othis.getView().getId();
          //       var PlantData = oData.results;
          //       var PlantModel = new sap.ui.model.json.JSONModel();

          //       PlantModel.setData({
          //         PlantData: PlantData,
          //       });
          //       var PlantTable = sap.ui.getCore().byId(Path + "--idInputPlant");

          //       PlantTable.setModel(PlantModel, "PlantModel");
          //     } catch (e) {
          //       alert(e.message);
          //     }
          //   },
          // });

          var Path = othis.getView().getId();
          // jQuery.sap.delayedCall(500, that, function () {
          //   sap.ui
          //     .getCore()
          //     .byId(Path + "--idInputWorkArea")
          //     .focus();
          // });
        },
        /* BUSY INDICATOR*/
        showBusyIndicator: function () {
          sap.ui.core.BusyIndicator.show(100);
        },
        showPostBusyIndicator: function () {
          this.showPstBusyIndicator(4000, 0);
        },
        hidePostBusyIndicator: function () {
          this.hidePstBusyIndicator();
        },
        hideBusyIndicator: function () {
          sap.ui.core.BusyIndicator.hide();
        },
        hidePstBusyIndicator: function () {
          BusyIndicator.hide();
        },
        wait: function (ms) {
          var start = new Date().getTime();
          var end = start;
          while (end < start + ms) {
            end = new Date().getTime();
          }
        },
        showPstBusyIndicator: function (iDuration, iDelay) {
          BusyIndicator.show(iDelay);
          this.wait(5000);
          if (iDuration && iDuration > 0) {
            if (this._sTimeoutId) {
              clearTimeout(this._sTimeoutId);
              this._sTimeoutId = null;
            }

            this._sTimeoutId = setTimeout(function () {
              this.hidePostBusyIndicator();
            }.bind(this), iDuration);
          }
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
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
                  // alert(e.message);
                }
              },
            }
          );
        },

        _onProdOrdNoHelp: function (oEvent) {
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

          var SelWCValue = sap.ui
            .getCore()
            .byId(`${Path}--idInputWorkCenter`)
            .getValue();

          if (!that.OrderDialog) {
            that.OrderDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.HelpOrder",
              that
            );
            that.getView().addDependent(that.OrderDialog);
          }
          // open value help dialog
          that.OrderDialog.open();
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'OrderNo' and Key04 eq '" +
            SelPlant +
            "' and Key05 eq '" +
            SelWCGrp +
            "' and Key03 eq '" +
            SelWCValue +
            "'",
            {
              context: null,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  var Path = that.getView().getId();
                  var OrderData = oData.results;
                  var OrderModel = new sap.ui.model.json.JSONModel();

                  OrderModel.setData({
                    OrderData: OrderData,
                  });
                  var OrderTable = sap.ui.getCore().byId("idHelpOrderDialog");

                  OrderTable.setModel(OrderModel, "OrderModel");
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
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
          var SelMatnr = "";
          var SelMaktx = "";

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];

          // Get Order No & Opr No
          if (Tableindex != undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }
            sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .clearSelection();
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
            SelMatnr = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data03;
            SelMaktx = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data04;
          }

          if (Tableindex === undefined) {
            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getSelectedIndices()[0];
            // Get Order No & Opr No
            if (Tableindex != undefined) {
              var aIndices = this.getView()
                .byId(`${Path}--idQueueOrderList`)
                .getBinding("rows").aIndices;
              for (var loop = 0; loop in aIndices; loop++) {
                if (loop === Tableindex) {
                  Tableindex = aIndices[loop];
                  break;
                  console.log(Tableindex);
                }
              }

              sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .clearSelection();
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

              SelMatnr = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data03;
              SelMatnr = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data04;
            }
          }
          if (Tableindex === undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idFutureOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idFutureOrderList`)
              .getSelectedIndices()[0];
            // Get Order No & Opr No
            if (Tableindex != undefined) {
              sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .clearSelection();
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

              SelMatnr = sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .getModel("InFutureModel")
                .getData().InFutureData[Tableindex].Data03;
              SelMaktx = sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .getModel("InFutureModel")
                .getData().InFutureData[Tableindex].Data04;
            }
          }
          if (Tableindex === undefined) {
            // Raise Message
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("BOM001");
            MessageBox.information(message);
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
                  if (BOMData.length != 0) {
                    that.BOMDialog.open();
                    var Popup = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("BOM003");
                    BOMTable.setTitle(
                      Popup + " " + SelMatnr + " - " + SelMaktx
                    );
                    sap.ui
                      .getCore()
                      .byId("idBOMDialog-cancel")
                      .setText("Close");
                  } else {
                    // Raise Message
                    var message = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("BOM002");
                    MessageToast.show(message);
                    $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                    return;
                  }
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
          var SelMatnr = "";
          var SelMaktx = "";

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .clearSelection();
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

            SelMatnr = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data03;
            SelMaktx = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data04;
          }
          if (Tableindex === undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idQueueOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getSelectedIndices()[0];
            // Get Order No & Opr No
            if (Tableindex != undefined) {
              sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .clearSelection();
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

              SelMatnr = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data03;
              SelMaktx = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data04;
            }
          }
          if (Tableindex === undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idFutureOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idFutureOrderList`)
              .getSelectedIndices()[0];
            // Get Order No & Opr No
            if (Tableindex != undefined) {
              sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .clearSelection();
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

              SelMatnr = sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .getModel("InFutureModel")
                .getData().InFutureData[Tableindex].Data03;
              SelMaktx = sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .getModel("InFutureModel")
                .getData().InFutureData[Tableindex].Data04;
            }
          }
          if (Tableindex === undefined) {
            // Raise Message
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Route001");
            MessageBox.information(message);
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
                  if (RoutingData.length != 0) {
                    that.RouteDialog.open();
                    sap.ui
                      .getCore()
                      .byId("idRoutingDialog-cancel")
                      .setText("Close");
                  } else {
                    // Raise Message
                    var message = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("Route002");
                    MessageToast.show(message);
                    $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                    return;
                  }
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
        _onOrderSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter("Data01", FilterOperator.Contains, sValue);
          var oBinding = oEvent.getParameter("itemsBinding");
          oBinding.filter([oFilter]);
        },

        onRoutingDataTableSelectDialogSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter({
            filters: [
              new Filter("Data02", FilterOperator.Contains, sValue),
              new Filter("Data03", FilterOperator.Contains, sValue),
              new Filter("Data04", FilterOperator.Contains, sValue),
              new Filter("Data05", FilterOperator.Contains, sValue),
              new Filter("Data06", FilterOperator.Contains, sValue),
              new Filter("Data07", FilterOperator.Contains, sValue),
              new Filter("Data08", FilterOperator.Contains, sValue),
            ],
          });
          var oBinding = oEvent.getParameter("itemsBinding");
          oBinding.filter([oFilter]);
        },
        onBOMDataTableSelectDialogSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter({
            filters: [
              new Filter("Data02", FilterOperator.Contains, sValue),
              new Filter("Data03", FilterOperator.Contains, sValue),
              new Filter("Data04", FilterOperator.Contains, sValue),
              new Filter("Data05", FilterOperator.Contains, sValue),
              new Filter("Data08", FilterOperator.Contains, sValue),
            ],
          });
          var oBinding = oEvent.getParameter("itemsBinding");
          oBinding.filter([oFilter]);
        },

        onBatchDataDialogSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter({
            filters: [
              new Filter("Data02", FilterOperator.Contains, sValue),
              new Filter("Data03", FilterOperator.Contains, sValue),
              new Filter("Data04", FilterOperator.Contains, sValue),
              new Filter("Data05", FilterOperator.Contains, sValue),
              new Filter("Data01", FilterOperator.Contains, sValue),
            ],
          });
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
        _OrderSelect: function (oEvent) {
          if (oEvent.getParameters().selectedItems != undefined) {
            var OrderNo = oEvent.getParameters().selectedItems[0].getTitle();
            if (OrderNo != undefined) {
              var Path = this.getView().getId();
              sap.ui
                .getCore()
                .byId(`${Path}--idInputProdOrdNo`)
                .setValue(OrderNo);

              sap.ui
                .getCore()
                .byId(`${Path}--idTextProdOrdNo`)
                .setText(OrderNo);

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

              sap.ui.getCore().byId(`${Path}--idInputWorkCenter`).setValue("");

              sap.ui
                .getCore()
                .byId(`${Path}--idTextWorkArea`)
                .setText(Workcenter);

              sap.ui.getCore().byId(`${Path}--idTextWorkCenter`).setText("");

              oEvent.getSource().getBinding("items").filter([]);
            } else {
              return;
            }
            this.onButtonPress();
          }
        },
        onPalLabelPressed: function (oEvent) {
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
          var SelAufnr = " ";
          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Material
          if (Tableindex != undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .clearSelection();
            index = 0;
            // SelMatnr = sap.ui
            //   .getCore()
            //   .byId(`${Path}--idInprogressOrderList`)._aRowClones[Tableindex].getCells()[4].getText();
            SelAufnr = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data02;

            SelMatnr = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data03;
          }
          if (Tableindex === undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idQueueOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getSelectedIndices()[0];
            // Get Material
            if (Tableindex != undefined) {
              sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .clearSelection();
              index = 1;
              SelAufnr = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data02;

              SelMatnr = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data03;
            }
          }
          if (Tableindex === undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idFutureOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idFutureOrderList`)
              .getSelectedIndices()[0];
            // Get Material
            if (Tableindex != undefined) {
              sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .clearSelection();
              index = 2;
              SelAufnr = sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .getModel("InFutureModel")
                .getData().InFutureData[Tableindex].Data02;

              SelMatnr = sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .getModel("InFutureModel")
                .getData().InFutureData[Tableindex].Data03;
            }
          }
          if (Tableindex === undefined) {
            // Raise Message
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Drawing001");
            MessageBox.information(message);
            return;
          }

          if (!that.LabelPrintDialog) {
            that.LabelPrintDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.LabelPrint",
              that
            );
            that.getView().addDependent(that.LabelPrintDialog);
          }

          sap.ui.getCore().byId("idLabelOrderNo").setValue(SelAufnr);
          sap.ui.getCore().byId("idLabelType").setSelectedKey('1');
          sap.ui.getCore().byId("idLabelTapeBatch").setValue("");
          sap.ui.getCore().byId("idLabelCount").setValue(1);
          sap.ui.getCore().byId("id01LabelTapeBatch").setVisible(false);
          sap.ui.getCore().byId("idLabelQuantity").setValue("");
          sap.ui.getCore().byId("idLabelInspectionDate").setValue("");
          sap.ui.getCore().byId("id02LabelQuantity").setVisible(false);
          sap.ui.getCore().byId("id03LabelInspectionDate").setVisible(false);
          that.LabelPrintDialog.open();

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
            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .clearSelection();
            index = 0;
            // SelMatnr = sap.ui
            //   .getCore()
            //   .byId(`${Path}--idInprogressOrderList`)._aRowClones[Tableindex].getCells()[4].getText();

            SelMatnr = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data03;
          }
          if (Tableindex === undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idQueueOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getSelectedIndices()[0];
            // Get Material
            if (Tableindex != undefined) {
              sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .clearSelection();
              index = 1;
              // SelMatnr = sap.ui
              //   .getCore()
              //   .byId(`${Path}--idQueueOrderList`)._aRowClones[Tableindex].getCells()[2].getText();
              SelMatnr = sap.ui
                .getCore()
                .byId(`${Path}--idQueueOrderList`)
                .getModel("InQueueModel")
                .getData().InQueueData[Tableindex].Data03;
            }
          }
          if (Tableindex === undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idFutureOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idFutureOrderList`)
              .getSelectedIndices()[0];
            // Get Material
            if (Tableindex != undefined) {
              sap.ui
                .getCore()
                .byId(`${Path}--idFutureOrderList`)
                .clearSelection();
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
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Drawing001");
            MessageBox.information(message);
            return;
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
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  if (oData.results.length != 0) {
                    var DrawingURl = oData.results[0];

                    var sSource = DrawingURl.Data02;
                    // Decode the Base64 string to binary
                    var binaryData = atob(sSource);

                    // Convert binary data to ArrayBuffer
                    var arrayBuffer = new ArrayBuffer(binaryData.length);
                    var uint8Array = new Uint8Array(arrayBuffer);
                    for (var i = 0; i < binaryData.length; i++) {
                      uint8Array[i] = binaryData.charCodeAt(i);
                    }
                    // Create a Blob object from ArrayBuffer
                    var blob = new Blob([uint8Array], {
                      type: "application/pdf",
                    });

                    // Create a URL for the Blob object
                    var blobUrl = URL.createObjectURL(blob);
                    // Open the URL in a new window
                    window.open(blobUrl);
                  } else {
                    // Raise Message
                    var message = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("NoDisplay");
                    MessageToast.show(message);
                    $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                    return;
                  }
                } catch (e) {
                  alert(e.message);
                }
              },
            }
          );
        },

        // Convert base64 to blob
        base64toBlob: function (base64Data, contentType) {
          contentType = contentType || "";
          var sliceSize = 1024;
          var byteCharacters = atob(base64Data);
          var bytesLength = byteCharacters.length;
          var slicesCount = Math.ceil(bytesLength / sliceSize);
          var byteArrays = new Array(slicesCount);

          for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            var begin = sliceIndex * sliceSize;
            var end = Math.min(begin + sliceSize, bytesLength);

            var bytes = new Array(end - begin);
            for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
              bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
          }
          return new Blob(byteArrays, {
            type: contentType,
          });
        },

        onStartPressed: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();
          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";
          var OprNumber = "";
          var OprStatus = "";

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

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
            OprNumber = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data16; // Operator No
            OprStatus = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data17;
          }

          if (Tableindex === undefined) {
            // Raise Message
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Start002");
            MessageBox.error(message);
            return;
          }

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          that.showBusyIndicator();

          if (!that.StartDialog) {
            that.StartDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.StartAction",
              that
            );
            that.getView().addDependent(that.StartDialog);
          }

          // open value help dialog
          // that.StartDialog.open();

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
          if (hr < 10) {
            hr = "0" + hr;
          }
          var mm = oDateTime.getMinutes().toString();
          if (mm < 10) {
            mm = "0" + mm;
          }
          var sec = oDateTime.getSeconds().toString();
          if (sec < 10) {
            sec = "0" + sec;
          }
          var oTimeFormat = hr + mm + sec;

          sap.ui.getCore().byId("idStartDate").setValue(oDateFormat);
          sap.ui.getCore().byId("idStartTime").setValue(oTimeFormat);
          sap.ui.getCore().byId("idSelectStartPlant").setValue(SelPlant);
          sap.ui.getCore().byId("idSelectOrder").setValue(SelAufnr);
          sap.ui.getCore().byId("idSelectOprNo").setValue(SelOprNo);
          sap.ui.getCore().byId("idStartText").setText("InProgress");
          if (OprStatus === "Critical") {
            sap.ui.getCore().byId("idStartOperator").setValue(OprNumber);
          } else {
            sap.ui.getCore().byId("idStartOperator").setValue("");
          }
          // jQuery.sap.delayedCall(500, that, function () {
          //   sap.ui.getCore().byId("idStartOperator").focus();
          // });
          that.hideBusyIndicator();
          that.onConfirmStartPress();

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
            var aIndices = this.getView()
              .byId(`${Path}--idQueueOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

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
          if (Tableindex === undefined) {
            // Raise Message
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Start002");
            MessageBox.error(message);
            return;
          }

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          that.showBusyIndicator();

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

          // var hr = oDateTime.getHours().toString();
          // var mm = oDateTime.getMinutes().toString();
          // var sec = oDateTime.getSeconds().toString();
          var hr = oDateTime.getHours().toString();
          if (hr < 10) {
            hr = "0" + hr;
          }
          var mm = oDateTime.getMinutes().toString();
          if (mm < 10) {
            mm = "0" + mm;
          }
          var sec = oDateTime.getSeconds().toString();
          if (sec < 10) {
            sec = "0" + sec;
          }
          var oTimeFormat = hr + mm + sec;

          sap.ui.getCore().byId("idStartOperator").setValue("");
          sap.ui.getCore().byId("idStartDate").setValue(oDateFormat);
          sap.ui.getCore().byId("idStartTime").setValue(oTimeFormat);
          sap.ui.getCore().byId("idSelectStartPlant").setValue(SelPlant);
          sap.ui.getCore().byId("idSelectOrder").setValue(SelAufnr);
          sap.ui.getCore().byId("idSelectOprNo").setValue(SelOprNo);
          sap.ui.getCore().byId("idStartText").setText("Queue");
          jQuery.sap.delayedCall(500, that, function () {
            sap.ui.getCore().byId("idStartOperator").focus();
          });

          that.hideBusyIndicator();
        },

        OnOperatorfill: function () {
          var that = this;
          var sValue = sap.ui.getCore().byId(`idStartOperator`).getValue();
          var ScreenText = sap.ui.getCore().byId("idStartText").getText();
          if (ScreenText === "InProgress") {
            that.StartDialog.close();
          }
          // var sValue = oEvent.getParameter("value");
          // open value help dialog
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
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  var sPath = that.getView().getId();
                  if (oData.results.length != 0) {
                    var emparray = oData.results[0];
                    sap.ui.getCore().byId(`idStartOperator`).setValue(emparray.Data02);
                    sap.ui
                      .getCore()
                      .byId(`idStartOperator`)
                      .setValueState("None");
                    // that.onConfirmStartPress();
                  } else {
                    sap.ui.getCore().byId(`idStartOperator`).setValue();
                    sap.ui
                      .getCore()
                      .byId(`idStartOperator`)
                      .setValueState("Error");
                    // Please contact admin to create you account
                    // Get Message
                    var Emessage = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("Start001");
                    sap.ui
                      .getCore()
                      .byId(`idStartOperator`)
                      .setValueStateText(Emessage);
                  }
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                  // alert(e.message);
                }
              },
            }
          );
        },
        onRouteNotesPressed: function () {
          var that = this;
          var index;
          var Path = that.getView().getId();
          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";
          var OprNumber = "";
          var OprStatus = "";

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

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
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Start002");
            MessageBox.error(message);
            return;
          }

          // Popup to show Text from Order
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'RoutingText' and Key02 eq '" +
            SelAufnr +
            "' and Key03 eq '" +
            SelOprNo +
            "'",
            {
              context: null,
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  that.hideBusyIndicator();
                  if (oData.results.length != 0) {
                    var LongText = oData.results[0];
                    // LongText.Data01.replace(/\n/g, " ");
                    var TitleText = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("Start005");
                    if (!that.oInfoMessageTextDialog) {
                      that.oInfoMessageTextDialog = new Dialog({
                        type: DialogType.Message,
                        title: TitleText,
                        state: ValueState.Information,
                        contentWidth: "45%",
                        contextHeight: "50%",
                        content: new Text({ text: LongText.Data01 }),
                        beginButton: new Button({
                          type: ButtonType.Emphasized,
                          text: "OK",
                          press: function () {
                            that.oInfoMessageTextDialog.close();
                          }.bind(that),
                        }),
                      });
                    }
                    that.oInfoMessageTextDialog.open();

                    // sap.ui.getCore().byId("idHeaderOrder").setText(SelAufnr);
                  } else {
                    // Raise Message
                    var message = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("NoData");
                    MessageToast.show(message);
                    $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                    return;
                  }
                } catch (e) {
                  that.hideBusyIndicator();
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                }
              },
            }
          );
        },
        onConfirmStartPress: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();
          var StartDate = sap.ui.getCore().byId("idStartDate").getValue();
          var StartTime = sap.ui.getCore().byId("idStartTime").getValue();
          var ScreenText = sap.ui.getCore().byId("idStartText").getText();
          var SelOrderNo = sap.ui.getCore().byId("idSelectOrder").getValue();
          var SelOrderOpr = sap.ui.getCore().byId("idSelectOprNo").getValue();
          if (ScreenText != "InProgress") {
            that.OnOperatorfill();
          }
          var OperatorNo = sap.ui.getCore().byId("idStartOperator").getValue();
          if (OperatorNo === "") {
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Start001");
            MessageBox.error(message);
            return;
          }


          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";
          var indicator = "";
          var ScreenOprNo = "";
          var ScreenStatus = "";
          if (ScreenText === "InProgress") {
            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getSelectedIndices()[0];
          } else {
            Tableindex = undefined;
          }

          // Get Order No & Opr No
          if (Tableindex != undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            // sap.ui
            //   .getCore()
            //   .byId(`${Path}--idInprogressOrderList`)
            //   .clearSelection();
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
            ScreenOprNo = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data16;
            ScreenStatus = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data17;
          } else {
            Tableindex = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getSelectedIndices()[0];
            // Get Order No & Opr No
            if (Tableindex != undefined) {
              var aIndices = this.getView()
                .byId(`${Path}--idQueueOrderList`)
                .getBinding("rows").aIndices;
              for (var loop = 0; loop in aIndices; loop++) {
                if (loop === Tableindex) {
                  Tableindex = aIndices[loop];
                  break;
                  console.log(Tableindex);
                }
              }

              // sap.ui
              //   .getCore()
              //   .byId(`${Path}--idQueueOrderList`)
              //   .clearSelection();
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

              // Cross checking to see is order already active inprogress
              var InProgessTable = sap.ui
                .getCore()
                .byId(`${Path}--idInprogressOrderList`)
                .getModel("InProgressModel")
                .getData();

              for (var i = 0; i < InProgessTable.InProgressData.length; i++) {
                if (
                  InProgessTable.InProgressData[i].Data02 === SelAufnr &&
                  InProgessTable.InProgressData[i].Data05 === SelOprNo &&
                  InProgessTable.InProgressData[i].Data16 === OperatorNo
                ) {
                  // Raise Message
                  var message = that
                    .getView()
                    .getModel("i18n")
                    .getResourceBundle()
                    .getText("Start003");
                  MessageBox.error(message);
                  return;
                }
              }
            }
          }

          if (ScreenStatus === "Success") {
            if (SelOrderNo === SelAufnr && SelOrderOpr === SelOprNo) {
              if (ScreenOprNo === OperatorNo) {
                // Raise Message
                var message = that
                  .getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("Start003");
                MessageBox.error(message);
                return;
              }
            }
          }
          if (Tableindex === undefined) {
            // Raise Message
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Start002");
            MessageBox.error(message);
            return;
          }

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          that.showBusyIndicator();

          var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
          var IEntry = {};
          IEntry.Key01 = "START";
          IEntry.Key02 = SelAufnr;
          IEntry.Key03 = SelOprNo;
          IEntry.Key04 = SelPlant;
          IEntry.Key05 = OperatorNo;
          IEntry.ConfirmType = " ";
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
          IEntry.NavWC_Component = [{}];
          if (ScreenText != "InProgress") {
            that.StartDialog.close();
          }

          oDataModel.create(
            "/WorkCenter_AreaOrderSet",
            IEntry,
            null,
            function (oData, Response) {
              try {
                that.hideBusyIndicator();
                // Raise Message
                var message = that
                  .getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("Start004");
                MessageToast.show(message + " " + SelAufnr + " / " + SelOprNo, {
                  width: "50em",
                  animationDuration: 2000,
                });
                $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
                that.onButtonPress();
                return;
              } catch (e) {
                alert(e.message);
                that.hideBusyIndicator();
              }
            }
          );
        },
        onCancelStartPress: function () {
          var that = this;
          sap.ui.getCore().byId(`idStartOperator`).setValueState();
          var Path = that.getView().getId();
          this.StartDialog.close();
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
            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

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
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Stop001");
            MessageBox.error(message);
            return;
          }

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          that.showBusyIndicator();

          if (!that.StopDialog) {
            that.StopDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.StopAction",
              that
            );
            that.getView().addDependent(that.StopDialog);
          }

          // open value help dialog
          // that.StopDialog.open();

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

          // var hr = oDateTime.getHours().toString();
          // var mm = oDateTime.getMinutes().toString();
          // var sec = +oDateTime.getSeconds().toString();
          var hr = oDateTime.getHours().toString();
          if (hr < 10) {
            hr = "0" + hr;
          }
          var mm = oDateTime.getMinutes().toString();
          if (mm < 10) {
            mm = "0" + mm;
          }
          var sec = oDateTime.getSeconds().toString();
          if (sec < 10) {
            sec = "0" + sec;
          }
          var oTimeFormat = hr + mm + sec;

          sap.ui.getCore().byId("idStartEndDate").setValue(SelStartDate);
          sap.ui.getCore().byId("idStartEndTime").setValue(SelStartTime);
          sap.ui.getCore().byId("idStopEndDate").setValue(oDateFormat);
          sap.ui.getCore().byId("idStopEndTime").setValue(oTimeFormat);
          sap.ui.getCore().byId("idSelectStopPlant").setValue(SelPlant);
          sap.ui.getCore().byId("idStopOperator").setValue(SelOpratorNo);
          // that.OnStopOperatorGet(SelOpratorNo);
          that.hideBusyIndicator();
          that.onConfirmStopPress();
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
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                }
              },
            }
          );
        },
        onLabelSelectChange: function (oEvent) {
          var SelKey = oEvent.getParameters().selectedItem.getKey();
          if (SelKey === "2") {
            sap.ui.getCore().byId("id01LabelTapeBatch").setVisible(true);
            sap.ui.getCore().byId("id02LabelQuantity").setVisible(true);
            sap.ui.getCore().byId("id03LabelInspectionDate").setVisible(true);
          } else {
            sap.ui.getCore().byId("id01LabelTapeBatch").setVisible(false);
            sap.ui.getCore().byId("id02LabelQuantity").setVisible(false);
            sap.ui.getCore().byId("id03LabelInspectionDate").setVisible(false);
          }
        },
        onConfirmLabelPress: function () {
          var that = this;
          var OrderNo = sap.ui.getCore().byId("idLabelOrderNo").getValue();
          var LabelCnt = sap.ui.getCore().byId("idLabelCount").getValue();
          var LabelType = sap.ui.getCore().byId("idLabelType").getSelectedKey();
          var TapeBatch = sap.ui.getCore().byId("idLabelTapeBatch").getValue();
          var Quantity = sap.ui.getCore().byId("idLabelQuantity").getValue();
          var InspectionDate = sap.ui.getCore().byId("idLabelInspectionDate").getValue();

          that.LabelPrintDialog.close();
          // Get the path to the Windows shared folder
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'LabelPrint' and Key02 eq '" +
            OrderNo +
            "' and Key03 eq '" +
            LabelCnt +
            "' and Key04 eq '" +
            LabelType +
            "' and Key05 eq '" +
            TapeBatch +
            "' and Data01 eq '" +
            Quantity +
            "' and Data02 eq '" +
            InspectionDate +
            "'",
            {
              context: null,
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  // Raise Message
                  var message = that
                    .getView()
                    .getModel("i18n")
                    .getResourceBundle()
                    .getText("OutputSuccess");
                  MessageToast.show(message);
                  $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
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

            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            // sap.ui
            //   .getCore()
            //   .byId(`${Path}--idInprogressOrderList`)
            //   .clearSelection();

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
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Stop001");
            MessageBox.error(message);
            return;
          }

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          that.showBusyIndicator();

          var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
          var IEntry = {};
          IEntry.Key01 = "STOP";
          IEntry.Key02 = SelAufnr;
          IEntry.Key03 = SelOprNo;
          IEntry.Key04 = SelPlant;
          IEntry.Key05 = OperatorNo;
          IEntry.ConfirmType = " ";
          IEntry.WorkCenterArea = " ";
          if (index === 0) {
            IEntry.NavWC_InProgress = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData;
            for (var ind = 0; ind < IEntry.NavWC_InProgress.length; ind++) {
              if (ind === Tableindex) {
                if (IEntry.NavWC_InProgress[ind].Data16 === OperatorNo) {
                  IEntry.NavWC_InProgress[ind].Data08 = EndDate;
                  IEntry.NavWC_InProgress[ind].Data09 = EndTime;
                }
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
          IEntry.NavWC_Component = [{}];
          // that.StopDialog.close();

          oDataModel.create(
            "/WorkCenter_AreaOrderSet",
            IEntry,
            null,
            function (oData, Response) {
              try {
                that.hideBusyIndicator();
                var message = that
                  .getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("Stop003");
                MessageToast.show(message + SelAufnr + "/" + SelOprNo, {
                  width: "50em",
                  animationDuration: 2000,
                });
                $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
                that.onButtonPress();
                return;
              } catch (e) {
                MessageToast.show(e.message);
                $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                that.hideBusyIndicator();
              }
            }
          );
        },
        onCancelLabelPress: function () {
          var that = this;
          that.LabelPrintDialog.close();
          return;
        },
        onCancelStopPress: function () {
          var that = this;
          that.StopDialog.close();
          var Path = that.getView().getId();
          // sap.ui
          //   .getCore()
          //   .byId(`${Path}--idInprogressOrderList`)
          //   .clearSelection();
          // Raise Message
          var message = that
            .getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("Gen001");
          MessageToast.show(message);
          $(".sapMMessageToast").addClass("sapMMessageToastInfo");
          return;
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
            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            // sap.ui
            //   .getCore()
            //   .byId(`${Path}--idInprogressOrderList`)
            //   .clearSelection();
            index = 0;
            // SelAufnr = sap.ui
            //   .getCore()
            //   .byId(`${Path}--idInprogressOrderList`)._aRowClones[Tableindex].getCells()[3].getText();
            // SelOprNo = sap.ui
            //   .getCore()
            //   .byId(`${Path}--idInprogressOrderList`)._aRowClones[Tableindex].getCells()[6].getText();
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
              var aIndices = this.getView()
                .byId(`${Path}--idQueueOrderList`)
                .getBinding("rows").aIndices;
              for (var loop = 0; loop in aIndices; loop++) {
                if (loop === Tableindex) {
                  Tableindex = aIndices[loop];
                  break;
                  console.log(Tableindex);
                }
              }

              // sap.ui
              //   .getCore()
              //   .byId(`${Path}--idQueueOrderList`)
              //   .clearSelection();
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

              var aIndices = this.getView()
                .byId(`${Path}--idFutureOrderList`)
                .getBinding("rows").aIndices;
              for (var loop = 0; loop in aIndices; loop++) {
                if (loop === Tableindex) {
                  Tableindex = aIndices[loop];
                  break;
                  console.log(Tableindex);
                }
              }

              // sap.ui
              //   .getCore()
              //   .byId(`${Path}--idFutureOrderList`)
              //   .clearSelection();

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
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Note001");
            MessageBox.error(message);
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
                    sap.ui.getCore().byId("idHeaderOrder").setText(SelAufnr);
                    sap.ui
                      .getCore()
                      .byId(`idDialogTextBox`)
                      .setTitle("Order No: " + SelAufnr + " Header Notes");
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
          var that = this;
          // MessageBox.information("Update will Happen in Backend");
          var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
          var Data01 = sap.ui.getCore().byId(`idHeaderText`).getValue();
          var Key01 = sap.ui.getCore().byId(`idHeaderOrder`).getText();

          var itemset = {
            Key01: "Save",
            Key02: Key01,
            Key03: "",
            Key04: "",
            Data01: Data01,
          };

          var IEntry = [];
          IEntry = itemset;
          oDataModel.create(
            "/ValueHelpSet",
            IEntry,
            null,
            function (oData, Response) {
              try {
                that.hideBusyIndicator();
                var message = that
                  .getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("Gen002");
                MessageToast.show(message);
                $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
                return;
              } catch (e) {
                MessageToast.show(e.message);
                $(".sapMMessageToast").addClass("sapMMessageToastDanger");
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
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";
          var OperatorNo = " ";
          var OperDispText = " ";

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            index = 0;

            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

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
            OperatorNo = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data16;
            OperDispText = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data20;
          }

          if (Tableindex === undefined) {
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Scarp003");
            MessageBox.error(message);
            return;
          }
          if (!that.ScrapActionDialog) {
            that.ScrapActionDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.ScarpAction",
              that
            );
            that.getView().addDependent(that.ScrapActionDialog);
          } else {
            if (that.ScrapActionDialog.isDestroyed() === true) {

              that.ScrapActionDialog = sap.ui.xmlfragment(
                "sap.pp.wcare.wmd.workmanagerapp.Fragments.ScarpAction",
                that
              );
              that.getView().addDependent(that.ScrapActionDialog);

            }
          }
          var message = that
            .getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("Scarp005");

          that.ScrapActionDialog.open();
          that.showBusyIndicator();
          sap.ui.getCore().byId("idDialogScarp").setTitle(message + ' ' + SelAufnr + " / " + OperDispText);

          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
          var vModel = new sap.ui.model.odata.ODataModel(sUrl, true);
          var logModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'Post' and Key02 eq '" +
            SelAufnr +
            "' and Key03 eq '" +
            SelOprNo +
            "' and Key04 eq '" +
            OperatorNo +
            "' and Key05 eq '" +
            SelPlant +
            "' and Data01 eq 'ScarpCall'",
            {
              context: null,
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  if (oData.results.length != 0) {
                    var ScarpData = oData.results;

                    if (ScarpData.length != 0) {
                      var ScarpModel = new sap.ui.model.json.JSONModel();

                      ScarpModel.setData({
                        ScarpData: ScarpData,
                      });
                      var ScarpList = sap.ui.getCore().byId("idScarpList");

                      ScarpList.setModel(ScarpModel, "ScarpModel");
                    }
                    that.hideBusyIndicator();
                  } else {
                    var ScarpData = []; // Dummy Data
                    var ScarpModel = new sap.ui.model.json.JSONModel();

                    ScarpModel.setData({
                      ScarpData: ScarpData,
                    });
                    var ScarpList = sap.ui.getCore().byId("idScarpList");

                    ScarpList.setModel(ScarpModel, "ScarpModel");
                    that.hideBusyIndicator();
                  }
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                }
              },
            }
          );
        },

        onScarpPostReasonRequest: function (oEvent) {
          var that = this;
          var Path = that.getView().getId();
          var sId = oEvent.getParameter("id");
          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          if (SelPlant === null) {
            SelPlant = "DKKV";
          }
          if (!that.ScarpReasonDialog) {
            that.ScarpReasonDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.HelpPostScarpReason",
              that
            );
            that.getView().addDependent(that.ScarpReasonDialog);
          }
          // open value help dialog
          that.ScarpReasonDialog.open();
          sPostReasonCodeId = sId;
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'ScrapReason' and Key02 eq '" +
            SelPlant +
            "'",
            {
              context: null,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  var ScarpReasonData = oData.results;
                  var ScarpReasonModel = new sap.ui.model.json.JSONModel();

                  ScarpReasonModel.setData({
                    ScarpReasonData: ScarpReasonData,
                  });
                  var ScarpReasonTable = sap.ui
                    .getCore()
                    .byId("idScarpReasonDialog");

                  ScarpReasonTable.setModel(
                    ScarpReasonModel,
                    "ScarpReasonModel"
                  );
                } catch (e) {
                  alert(e.message);
                }
              },
            }
          );
        },

        onScarpReasonRequest: function (oEvent) {
          var that = this;
          var Path = that.getView().getId();
          var sId = oEvent.getParameter("id");
          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          if (SelPlant === null) {
            SelPlant = "DKKV";
          }
          if (!that.ScarpReasonDialog) {
            that.ScarpReasonDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.HelpScarpReason",
              that
            );
            that.getView().addDependent(that.ScarpReasonDialog);
          }
          // open value help dialog
          that.ScarpReasonDialog.open();
          sReasonCodeId = sId;
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'ScrapReason' and Key02 eq '" +
            SelPlant +
            "'",
            {
              context: null,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  var ScarpReasonData = oData.results;
                  var ScarpReasonModel = new sap.ui.model.json.JSONModel();

                  ScarpReasonModel.setData({
                    ScarpReasonData: ScarpReasonData,
                  });
                  var ScarpReasonTable = sap.ui
                    .getCore()
                    .byId("idScarpReasonDialog");

                  ScarpReasonTable.setModel(
                    ScarpReasonModel,
                    "ScarpReasonModel"
                  );
                } catch (e) {
                  alert(e.message);
                }
              },
            }
          );
        },
        _onScarpPostReasonSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter("Data03", FilterOperator.Contains, sValue);
          var oBinding = oEvent.getParameter("itemsBinding");
          oBinding.filter([oFilter]);
        },
        _onScarpReasonSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter("Data03", FilterOperator.Contains, sValue);
          var oBinding = oEvent.getParameter("itemsBinding");
          oBinding.filter([oFilter]);
        },
        _ScarpPostReasonSelect: function (oEvent) {
          var that = this;
          var ScarpDataLine = [];
          if (oEvent.getParameters().selectedItems != undefined) {
            var ScarpReason = oEvent
              .getParameters()
              .selectedItems[0].getTitle();

            var ScarpText = oEvent
              .getParameters()
              .selectedItems[0].getDescription();

            if (ScarpReason != undefined) {

              var ScarpData = sap.ui
                .getCore()
                .byId("idPostScarpList")
                .getModel("PostScarpModel")
                .getData().PostScarpData;
              // }
              // sReasonCodeId
              var HelpReasonCodePath = sap.ui.getCore().byId(sPostReasonCodeId).getParent().oBindingContexts.PostScarpModel.sPath;
              var HelpReasonCodeArray = HelpReasonCodePath.split("/");
              var HelpReasonCodeUpdate = parseInt(HelpReasonCodeArray[2]);

              for (var ind = 0; ind < ScarpData.length; ind++) {
                if (ScarpData[ind].Data06 === ScarpReason) {
                  HelpReasonCodeUpdate = ind;
                  var message = that
                    .getView()
                    .getModel("i18n")
                    .getResourceBundle()
                    .getText("Gen005");
                  MessageToast.show(message);
                  $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
                }
                if (HelpReasonCodeUpdate === ind) {
                  ScarpData[ind].Data06 = ScarpReason;
                  ScarpData[ind].Data07 = ScarpText;
                }
                ScarpDataLine.push(ScarpData[ind]);
              }

              sap.ui
                .getCore()
                .byId("idPostScarpList")
                .getModel("PostScarpModel")
                .setData({ PostScarpData: ScarpDataLine });
            } else {
              return;
            }
          }
        },

        _ScarpReasonSelect: function (oEvent) {
          var that = this;
          var ScarpDataLine = [];
          if (oEvent.getParameters().selectedItems != undefined) {
            var ScarpReason = oEvent
              .getParameters()
              .selectedItems[0].getTitle();

            var ScarpText = oEvent
              .getParameters()
              .selectedItems[0].getDescription();

            if (ScarpReason != undefined) {
              // Tableindex = sap.ui
              //   .getCore()
              //   .byId(`idScarpList`)
              //   .getSelectedIndices()[0];
              // if (Tableindex != undefined) {

              var ScarpData = sap.ui
                .getCore()
                .byId("idScarpList")
                .getModel("ScarpModel")
                .getData().ScarpData;
              // }
              // sReasonCodeId
              var HelpReasonCodePath = sap.ui.getCore().byId(sReasonCodeId).getParent().oBindingContexts.ScarpModel.sPath;
              var HelpReasonCodeArray = HelpReasonCodePath.split("/");
              var HelpReasonCodeUpdate = parseInt(HelpReasonCodeArray[2]);

              for (var ind = 0; ind < ScarpData.length; ind++) {
                if (ScarpData[ind].Data06 === ScarpReason) {
                  HelpReasonCodeUpdate = ind;
                  var message = that
                    .getView()
                    .getModel("i18n")
                    .getResourceBundle()
                    .getText("Gen005");
                  MessageToast.show(message);
                  $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
                }
                if (HelpReasonCodeUpdate === ind) {
                  ScarpData[ind].Data06 = ScarpReason;
                  ScarpData[ind].Data07 = ScarpText;
                }
                ScarpDataLine.push(ScarpData[ind]);
              }

              sap.ui
                .getCore()
                .byId("idScarpList")
                .getModel("ScarpModel")
                .setData({ ScarpData: ScarpDataLine });
            } else {
              return;
            }
          }
        },
        onConfirmScarpPress: function (oEvent) {
          var that = this;
          var Path = that.getView().getId();
          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";
          var SelOprerator = " ";
          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }
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
            SelOprerator = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data16;
          }

          var Error = "";
          var ScarpData = sap.ui
            .getCore()
            .byId("idScarpList")
            .getModel("ScarpModel")
            .getData().ScarpData;

          for (var ind = 0; ind < ScarpData.length; ind++) {
            if (ScarpData[ind].Data06 === "") {
              var message = that
                .getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("Scarp001");
              MessageBox.error(message);
              Error = 'X';
              return;
            }
            if (ScarpData[ind].Data05 === "") {
              var message = that
                .getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("Scarp002");
              MessageBox.error(message);
              Error = 'X';
              return;
            }
          }
          if (Error === 'X') {
            return;
          }

          that.ScrapActionDialog.close();
          that.onScarpupdate(that, SelAufnr, SelOprNo, SelPlant, SelOprerator, ScarpData);

        },

        onScarpupdate: function (that, SelAufnr, SelOprNo, SelPlant, SelOprerator, ScarpData) {

          // Dummy Call to Delete Table Entry
          var IEntry = [];
          var Process = "";
          var itemset = {
            Key01: "ScarpDel",
            Key02: SelAufnr,
            Key03: SelOprNo,
            Key04: SelPlant,
            Key05: SelOprerator,
            Data01: " ",
            Data02: " ",
          };

          IEntry = itemset;
          var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
          oDataModel.create(
            "/ValueHelpSet",
            IEntry,
            null,
            function (oData, Response) {
              try {
                if (Response.data.Data01 === "S") {
                  that.hideBusyIndicator();
                  Process = 'X';
                }
                if (Response.data.Data01 === "E") {
                  that.hideBusyIndicator();
                  Process = 'X';
                }
              } catch (e) {
                // alert(e.message);
                MessageBox.error(e.message);
                that.hideBusyIndicator();
              }
            }
          );
          if (Process != 'X') {
            return;
          }
          for (var ind = 0; ind < ScarpData.length; ind++) {
            var itemset = {
              Key01: "Scarp",
              Key02: SelAufnr,
              Key03: SelOprNo,
              Key04: SelPlant,
              Key05: SelOprerator,
              Data01: ScarpData[ind].Data06,
              Data02: ScarpData[ind].Data05,
            };

            var IEntry = [];
            IEntry = itemset;
            var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
            var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
            oDataModel.create(
              "/ValueHelpSet",
              IEntry,
              null,
              function (oData, Response) {
                try {
                  if (Response.data.Data01 === "S") {
                    that.hideBusyIndicator();
                    var message = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("Gen003");

                    MessageToast.show(message + " " + SelAufnr + " / " + SelOprNo, {
                      width: "200em",
                      animationDuration: 2000,
                    });

                    $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
                    // return;
                  }
                  if (Response.data.Data01 === "E") {
                    that.hideBusyIndicator();
                    MessageBox.error(Response.data.Data02);
                    // return;
                  }
                } catch (e) {
                  // alert(e.message);
                  MessageBox.error(e.message);
                  that.hideBusyIndicator();
                }
              }
            );
          }
          that.onButtonPress();
        },
        onConfirmScarpMorePress: function (oEvent) {
          // var that = this;
          // var Path = that.getView().getId();
          // var Tableindex = "X";
          // var SelAufnr = " ";
          // var SelOprNo = " ";
          // var SelOprerator = " ";
          // var SelPlant = sap.ui
          //   .getCore()
          //   .byId(`${Path}--idInputPlant`)
          //   .getValue();

          // Tableindex = sap.ui
          //   .getCore()
          //   .byId(`${Path}--idInprogressOrderList`)
          //   .getSelectedIndices()[0];
          // // Get Order No & Opr No
          // if (Tableindex != undefined) {
          //   // sap.ui.getCore().byId(`${Path}--idInprogressOrderList`).clearSelection();
          //   var aIndices = this.getView()
          //     .byId(`${Path}--idInprogressOrderList`)
          //     .getBinding("rows").aIndices;
          //   for (var loop = 0; loop in aIndices; loop++) {
          //     if (loop === Tableindex) {
          //       Tableindex = aIndices[loop];
          //       break;
          //       console.log(Tableindex);
          //     }
          //   }

          //   SelAufnr = sap.ui
          //     .getCore()
          //     .byId(`${Path}--idInprogressOrderList`)
          //     .getModel("InProgressModel")
          //     .getData().InProgressData[Tableindex].Data02;
          //   SelOprNo = sap.ui
          //     .getCore()
          //     .byId(`${Path}--idInprogressOrderList`)
          //     .getModel("InProgressModel")
          //     .getData().InProgressData[Tableindex].Data05;
          //   SelOprerator = sap.ui
          //     .getCore()
          //     .byId(`${Path}--idInprogressOrderList`)
          //     .getModel("InProgressModel")
          //     .getData().InProgressData[Tableindex].Data16;
          // }

          // var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          // var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
          // var Data01 = sap.ui.getCore().byId(`idScarpReason`).getValue();
          // if (Data01 === "") {
          //   var message = that
          //     .getView()
          //     .getModel("i18n")
          //     .getResourceBundle()
          //     .getText("Scarp001");
          //   MessageBox.error(message);
          //   return;
          // }
          // var Data02 = sap.ui.getCore().byId(`idScarpQuantity`).getValue();
          // if (Data02 === "") {
          //   var message = that
          //     .getView()
          //     .getModel("i18n")
          //     .getResourceBundle()
          //     .getText("Scarp002");
          //   MessageBox.error(message);
          //   return;
          // }

          // // that.ScrapActionDialog.close();   Keep to Open to Save more value

          // var itemset = {
          //   Key01: "Scarp",
          //   Key02: SelAufnr,
          //   Key03: SelOprNo,
          //   Key04: SelPlant,
          //   Key05: SelOprerator,
          //   Data01: Data01,
          //   Data02: Data02,
          // };

          // var IEntry = [];
          // IEntry = itemset;
          // oDataModel.create(
          //   "/ValueHelpSet",
          //   IEntry,
          //   null,
          //   function (oData, Response) {
          //     try {
          //       if (Response.data.Data01 === "S") {
          //         that.hideBusyIndicator();
          //         var message = that
          //           .getView()
          //           .getModel("i18n")
          //           .getResourceBundle()
          //           .getText("Gen003");
          //         MessageToast.show(message);
          //         $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
          //         // that.onButtonPress();
          //         sap.ui.getCore().byId(`idScarpReason`).setValue("");
          //         sap.ui.getCore().byId(`idScarpQuantity`).setValue("");
          //         return;
          //       }
          //       if (Response.data.Data01 === "E") {
          //         that.hideBusyIndicator();
          //         MessageBox.error(Response.data.Data02);
          //         return;
          //       }
          //     } catch (e) {
          //       // alert(e.message);
          //       MessageToast.show(e.message);
          //       $(".sapMMessageToast").addClass("sapMMessageToastDanger");
          //       that.hideBusyIndicator();
          //     }
          //   }
          // );
        },
        onAfterCloseScarpPress: function () {
          this.ScrapActionDialog.destroy(true);
        },
        onCancelScarpPress: function (oEvent) {
          var that = this;
          var Path = that.getView().getId();
          if (sap.ui.getCore().byId(sReasonCodeId) != undefined) {
            sap.ui.getCore().byId(sReasonCodeId).setValueState("None");
          }
          // sap.ui
          //   .getCore()
          //   .byId(`${Path}--idInprogressOrderList`)
          //   .clearSelection();
          // that.onButtonPress();
          that.ScrapActionDialog.close();
        },
        onPostPressed: function () {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";
          var OperatorNo = " ";
          var EndDate;
          var TotTime = " ";
          var QtyAvail = "";
          var OperDispText = " ";
          var OrdQty = " ";
          var ComQty = " ";
          var Firstline = " ";
          // var SetupTIme = " ";

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            index = 0;

            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }
            that.showBusyIndicator();

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
            OperatorNo = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data16;
            EndDate = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data08;
            TotTime = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data13;
            QtyAvail = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data10;

            Firstline = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Key05;

            if (Firstline === '00000001') {

              OrdQty = sap.ui
                .getCore()
                .byId(`${Path}--idInprogressOrderList`)
                .getModel("InProgressModel")
                .getData().InProgressData[Tableindex].Data06;

              ComQty = sap.ui
                .getCore()
                .byId(`${Path}--idInprogressOrderList`)
                .getModel("InProgressModel")
                .getData().InProgressData[Tableindex].Data11;

              var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
              var oQtyModel = new sap.ui.model.odata.ODataModel(sUrl, true);

              oQtyModel.read(
                "/ValueHelpSet?$filter=Key01 eq 'QtyCalc' and Key02 eq '" +
                OrdQty +
                "' and Key03 eq '" +
                ComQty +
                "' and Key04 eq '" +
                QtyAvail +
                "'",
                {
                  context: null,
                  async: false,
                  urlParameters: null,
                  success: function (oData, oResponse) {
                    try {
                      if (oData.results.length != 0) {
                        QtyAvail = oData.results[0].Data01;
                      } else {
                        QtyAvail = 0;
                      }
                    } catch (e) {
                      that.hideBusyIndicator();
                      MessageToast.show(e.message);
                      $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                    }
                  },
                }
              );

              // OrdQty = parseFloat(OrdQty);
              // ComQty = parseFloat(ComQty);
              // QtyAvail = OrdQty - ComQty;
              // QtyAvail = parseFloat((QtyAvail).toFixed(3));

              // if (QtyAvail < 0) {
              //   QtyAvail = 0;
              // }

            }
            OperDispText = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data20;
          }
          if (EndDate === "") {
            that.hideBusyIndicator();
            that.onStopPressed();
            // var message = that
            //   .getView()
            //   .getModel("i18n")
            //   .getResourceBundle()
            //   .getText("Post002");
            // MessageBox.error(message);
            // return;
          }
          if (Tableindex === undefined) {
            that.hideBusyIndicator();
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Post001");
            MessageBox.error(message);
            return;
          }
          if (!that.PostActionDialog) {
            that.PostActionDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.PostAction",
              that
            );
            that.getView().addDependent(that.PostActionDialog);
          } else {
            if (that.PostActionDialog.isDestroyed() === true) {

              that.PostActionDialog = sap.ui.xmlfragment(
                "sap.pp.wcare.wmd.workmanagerapp.Fragments.PostAction",
                that
              );
              that.getView().addDependent(that.PostActionDialog);

            }
          }
          that.PostActionDialog.open();

          var Head = that
            .getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("PostAction");
          var Heading = Head + " - " + SelAufnr + " / " + OperDispText;
          sap.ui.getCore().byId("idDialogPost").setTitle(Heading);
          sap.ui.getCore().byId(`idPostOperator`).setValue(OperatorNo);
          sap.ui.getCore().byId(`idSelectPostPlant`).setValue(SelPlant);
          TotTime = parseInt(TotTime);
          sap.ui.getCore().byId("idPostTotalTime").setValue(TotTime);
          // QtyAvail = parseFloat(QtyAvail);
          sap.ui.getCore().byId(`idPostQuantity`).setValue(QtyAvail);
          sap.ui.getCore().byId(`idPostConfType`).setSelectedKey('P');

          var message = that
            .getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("Scarp005");

          sap.ui.getCore().byId("idPostScarpList").setTitle(message);

          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
          var vModel = new sap.ui.model.odata.ODataModel(sUrl, true);
          var logModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'Post' and Key02 eq '" +
            SelAufnr +
            "' and Key03 eq '" +
            SelOprNo +
            "' and Key04 eq '" +
            OperatorNo +
            "' and Key05 eq '" +
            SelPlant +
            "' and Data01 eq 'PostCall'",
            {
              context: null,
              async: true,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  if (oData.results.length != 0) {
                    var PostScarpData = oData.results;

                    if (PostScarpData.length != 0) {
                      var PostScarpModel = new sap.ui.model.json.JSONModel();

                      PostScarpModel.setData({
                        PostScarpData: PostScarpData,
                      });
                      var PostScarpList = sap.ui
                        .getCore()
                        .byId("idPostScarpList");

                      PostScarpList.setModel(PostScarpModel, "PostScarpModel");
                    }
                    that.hideBusyIndicator();
                  } else {
                    var PostScarpData = []; // Dummy Data
                    var PostScarpModel = new sap.ui.model.json.JSONModel();

                    PostScarpModel.setData({
                      PostScarpData: PostScarpData,
                    });
                    var PostScarpList = sap.ui
                      .getCore()
                      .byId("idPostScarpList");

                    PostScarpList.setModel(PostScarpModel, "PostScarpModel");
                    that.hideBusyIndicator();
                  }
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                }
              },
            }
          );

          that.showBusyIndicator();

          vModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'Component' and Key02 eq '" +
            SelAufnr +
            "' and Key03 eq '" +
            SelOprNo +
            "' and Key04 eq '" +
            OperatorNo +
            "' and Key05 eq '" +
            SelPlant +
            "'",
            {
              context: null,
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  var Visible = " ";
                  if (oData.results.length != 0) {
                    var ComponentData = oData.results;
                    if (ComponentData.length != 0) {

                      var ComponentModel101 = new sap.ui.model.json.JSONModel();
                      var ComponentModel261 = new sap.ui.model.json.JSONModel();
                      var ComponentModel561 = new sap.ui.model.json.JSONModel();

                      var ComponentDataLoop101 = [];
                      var ComponentDataLoop261 = [];
                      var ComponentDataLoop561 = [];


                      for (var i = 0; i in ComponentData; i++) {
                        if (ComponentData[i].Data08 === "101") {
                          ComponentData[i].Data09 = false;
                          if (ComponentData[i].Data13 === "false") {
                            Visible = 'X';
                          }
                        } else {
                          ComponentData[i].Data09 = true;
                        }
                        if (ComponentData[i].Data10 === "false") {
                          ComponentData[i].Data10 = false;
                          ComponentData[i].Data15 = false;
                        } else {
                          ComponentData[i].Data10 = true;
                          ComponentData[i].Data15 = true;
                        }
                        if (ComponentData[i].Data08 === '101') {
                          ComponentDataLoop101.push(ComponentData[i]);
                        } else if (ComponentData[i].Data08 === '261') {
                          ComponentDataLoop261.push(ComponentData[i]);
                        } else {
                          ComponentDataLoop561.push(ComponentData[i]);
                        }

                      }
                      if (ComponentDataLoop101.length != 0) {
                        sap.ui.getCore().byId("idPostComponentList101").setVisible(true);
                        ComponentModel101.setData({
                          ComponentData101: ComponentDataLoop101,
                        });

                        var ComponentnList101 = sap.ui
                          .getCore()
                          .byId("idPostComponentList101");

                        var HeaderText = that
                          .getView()
                          .getModel("i18n")
                          .getResourceBundle()
                          .getText("GRDetail");


                        ComponentnList101.setTitle(HeaderText);

                        ComponentnList101.setModel(ComponentModel101, "ComponentModel101");
                      } else {

                        ComponentModel101.setData({
                          ComponentData101: ComponentDataLoop101,
                        });
                        sap.ui.getCore().byId("idPostComponentList101").setVisible(false);
                      }

                      if (ComponentDataLoop261.length != 0) {
                        sap.ui.getCore().byId("idPostComponentList261").setVisible(true);
                        ComponentModel261.setData({
                          ComponentData261: ComponentDataLoop261,
                        });

                        var ComponentnList261 = sap.ui
                          .getCore()
                          .byId("idPostComponentList261");

                        var HeaderText = that
                          .getView()
                          .getModel("i18n")
                          .getResourceBundle()
                          .getText("CompTitle");


                        ComponentnList261.setTitle(HeaderText);

                        ComponentnList261.setModel(ComponentModel261, "ComponentModel261");
                      } else {

                        ComponentModel261.setData({
                          ComponentData261: ComponentDataLoop261,
                        });

                        sap.ui.getCore().byId("idPostComponentList261").setVisible(false);

                      }

                      if (ComponentDataLoop561.length != 0) {
                        sap.ui.getCore().byId("idPostComponentList561").setVisible(true);
                        ComponentModel561.setData({
                          ComponentData561: ComponentDataLoop561,
                        });

                        var ComponentnList561 = sap.ui
                          .getCore()
                          .byId("idPostComponentList561");

                        var HeaderText = that
                          .getView()
                          .getModel("i18n")
                          .getResourceBundle()
                          .getText("Receipts");

                        ComponentnList561.setTitle(HeaderText);

                        ComponentnList561.setModel(ComponentModel561, "ComponentModel561");
                      } else {

                        ComponentModel561.setData({
                          ComponentData561: ComponentDataLoop561,
                        });

                        sap.ui.getCore().byId("idPostComponentList561").setVisible(false);

                      }

                    }
                    if (Visible === 'X') {
                      // sap.ui.getCore().byId("id101Add").setVisible(false);
                      sap.ui.getCore().byId("id101Copy").setVisible(false);
                      sap.ui.getCore().byId("id101Del").setVisible(false);
                    } else {
                      // sap.ui.getCore().byId("id101Add").setVisible(true);
                      sap.ui.getCore().byId("id101Copy").setVisible(true);
                      sap.ui.getCore().byId("id101Del").setVisible(true);
                    }
                    that.hideBusyIndicator();
                  } else {
                    var ComponentModel101 = new sap.ui.model.json.JSONModel();
                    var ComponentModel261 = new sap.ui.model.json.JSONModel();
                    var ComponentModel561 = new sap.ui.model.json.JSONModel();

                    var ComponentDataLoop101 = [];
                    var ComponentDataLoop261 = [];
                    var ComponentDataLoop561 = [];


                    var ComponentnList101 = sap.ui
                      .getCore()
                      .byId("idPostComponentList101");
                    var ComponentnList261 = sap.ui
                      .getCore()
                      .byId("idPostComponentList261");
                    var ComponentnList561 = sap.ui
                      .getCore()
                      .byId("idPostComponentList561");

                    ComponentnList101.setModel(ComponentModel101, "ComponentModel101");
                    ComponentModel101.setData({
                      ComponentData101: ComponentDataLoop101,
                    });
                    ComponentnList261.setModel(ComponentModel261, "ComponentModel261");
                    ComponentModel261.setData({
                      ComponentData261: ComponentDataLoop261,
                    });
                    ComponentnList561.setModel(ComponentModel561, "ComponentModel561");
                    ComponentModel561.setData({
                      ComponentData561: ComponentDataLoop561,
                    });

                    sap.ui.getCore().byId("idPostComponentList101").setVisible(false);
                    sap.ui.getCore().byId("idPostComponentList261").setVisible(false);
                    sap.ui.getCore().byId("idPostComponentList561").setVisible(false);

                    that.hideBusyIndicator();
                  }
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                  // alert(e.message);
                }
              },
            }
          );

          that.showBusyIndicator();
          logModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'LogData' and Key02 eq '" +
            SelAufnr +
            "' and Key03 eq '" +
            SelOprNo +
            "' and Key04 eq '" +
            OperatorNo +
            "' and Key05 eq '" +
            SelPlant +
            "'",
            {
              context: null,
              async: true,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  if (oData.results.length != 0) {
                    var ActivityData = oData.results;

                    if (ActivityData.length != 0) {
                      var ActivityModel = new sap.ui.model.json.JSONModel();

                      ActivityModel.setData({
                        ActivityData: ActivityData,
                      });
                      var PostActivityList = sap.ui
                        .getCore()
                        .byId("idPostActivityList");

                      PostActivityList.setModel(ActivityModel, "ActivityModel");
                    }
                    that.hideBusyIndicator();
                  } else {
                    var ActivityData = []; // Dummy Data
                    var ActivityModel = new sap.ui.model.json.JSONModel();

                    ActivityModel.setData({
                      ActivityData: ActivityData,
                    });
                    var PostActivityList = sap.ui
                      .getCore()
                      .byId("idPostActivityList");

                    PostActivityList.setModel(ActivityModel, "ActivityModel");

                    that.hideBusyIndicator();
                  }
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                }
              },
            }
          );
          jQuery.sap.delayedCall(500, that, function () {
            sap.ui.getCore().byId("idPostQuantity").focus();
            sap.ui.getCore().byId(`idPostQuantity`).fireChangeEvent();
            // Trigger On Change Event
          });
        },
        onConfirmPostPress: function () {
          var that = this;
          var index;
          var Path = that.getView().getId();
          // that.showPostBusyIndicator();
          var TitleText = that
            .getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("Buffer");
          if (!that.oInfoMessageDialog) {
            that.oInfoMessageDialog = new Dialog({
              type: DialogType.Message,
              state: ValueState.Information,
              content: new Text({ text: "Processing..." }),
            });
          }
          that.oInfoMessageDialog.open();
          var oGlobalBusyDialog = new sap.m.BusyDialog();
          oGlobalBusyDialog.open();

          var YeildQty = sap.ui.getCore().byId("idPostQuantity").getValue();
          // var SetupTime = sap.ui.getCore().byId("idPostSetupTIme").getValue();
          var BinDet = sap.ui.getCore().byId("idPostBinDet").getValue();
          var ConfType = sap.ui
            .getCore()
            .byId("idPostConfType")
            .getSelectedKey();

          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";
          var OperatorNo = " ";

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            index = 0;

            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

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

            OperatorNo = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data16;
          }
          if (Tableindex === undefined) {
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Post001");
            MessageBox.error(message);
            // that.hidePostBusyIndicator();
            oGlobalBusyDialog.close();
            that.oInfoMessageDialog.close();
            return;
          }

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();

          var ScarpData = sap.ui
            .getCore()
            .byId("idPostScarpList")
            .getModel("PostScarpModel")
            .getData().PostScarpData;

          // that.onScarpupdate(that, SelAufnr, SelOprNo, SelPlant, OperatorNo, ScarpData);

          var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
          var IEntry = {};
          IEntry.Key01 = "POST";
          IEntry.Key02 = SelAufnr;
          IEntry.Key03 = SelOprNo;
          IEntry.Key04 = SelPlant;
          IEntry.Key05 = OperatorNo;
          IEntry.ConfirmType = ConfType;
          IEntry.WorkCenterArea = BinDet;
          if (index === 0) {
            IEntry.NavWC_InProgress = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData;
            for (var ind = 0; ind < IEntry.NavWC_InProgress.length; ind++) {
              if (ind === Tableindex) {
                IEntry.NavWC_InProgress[ind].Data11 = YeildQty;
              }
            }
            sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .setData("InProgressData", IEntry.NavWC_InProgress);

            IEntry.NavWC_Queue = [{}];
          }

          IEntry.NavWC_Future = [{}];
          var Yeildline = 0;

          // Get Component Details
          IEntry.NavWC_Component = [];
          if (sap.ui.getCore().byId("idPostComponentList101").getModel("ComponentModel101") != undefined) {
            var ComponentList101 = sap.ui
              .getCore()
              .byId("idPostComponentList101")
              .getModel("ComponentModel101")
              .getData().ComponentData101;
            if (ComponentList101.length != 0) {
              for (var i = 0; i in ComponentList101; i++) {
                if (ComponentList101[i].Key01 != '531') {
                  Yeildline = Yeildline + parseInt(ComponentList101[i].Data06);
                  // Yeildline = Yeildline + ComponentList101[i].Data06;
                }
                IEntry.NavWC_Component.push(ComponentList101[i]);
              }
              // var CheckQty = parseFloat(YeildQty);
              var CheckQty = parseInt(YeildQty);
              if (Yeildline != CheckQty) {
                // that.hidePostBusyIndicator();
                oGlobalBusyDialog.close();
                that.oInfoMessageDialog.close();
                var message = that
                  .getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("Post004");

                MessageToast.show(message);
                $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                return;
              }
            }
          }
          if (sap.ui.getCore().byId("idPostComponentList261").getModel("ComponentModel261") != undefined) {
            var ComponentList261 = sap.ui
              .getCore()
              .byId("idPostComponentList261")
              .getModel("ComponentModel261")
              .getData().ComponentData261;

            if (ComponentList261.length != 0) {
              for (var i = 0; i in ComponentList261; i++) {
                IEntry.NavWC_Component.push(ComponentList261[i]);
              }
            }
          }
          if (sap.ui.getCore().byId("idPostComponentList561").getModel("ComponentModel561") != undefined) {
            var ComponentList561 = sap.ui
              .getCore()
              .byId("idPostComponentList561")
              .getModel("ComponentModel561")
              .getData().ComponentData561;
            if (ComponentList561.length != 0) {
              for (var i = 0; i in ComponentList561; i++) {
                IEntry.NavWC_Component.push(ComponentList561[i]);
              }
            }
          }


          if (IEntry.NavWC_Component.length === 0) {
            IEntry.NavWC_Component = [{}];
          } else {
            for (var bth = 0; bth < IEntry.NavWC_Component.length; bth++) {
              if (IEntry.NavWC_Component[bth].Data06 != "") {
                var Qty = parseFloat(IEntry.NavWC_Component[bth].Data06);
                if (Qty != 0) {
                  if (IEntry.NavWC_Component[bth].Data08 === '101') {
                    if (IEntry.NavWC_Component[bth].Data12 === "") {
                      // that.hidePostBusyIndicator();
                      oGlobalBusyDialog.close();
                      that.oInfoMessageDialog.close();
                      var message = that
                        .getView()
                        .getModel("i18n")
                        .getResourceBundle()
                        .getText("DestBinChk");

                      MessageToast.show(message);
                      $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                      return;
                    }
                  }

                  if (IEntry.NavWC_Component[bth].Data05 === "") {
                    // that.hidePostBusyIndicator();
                    oGlobalBusyDialog.close();
                    that.oInfoMessageDialog.close();
                    var message = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("Post003");

                    MessageToast.show(message);
                    $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                    return;
                  }
                }
              }
            }
          }
          oDataModel.create(
            "/WorkCenter_AreaOrderSet",
            IEntry,
            null,
            function (oData, Response) {
              try {
                // that.hidePostBusyIndicator();
                oGlobalBusyDialog.close();
                that.oInfoMessageDialog.close();
                if (oData.Key04 === "E") {
                  var message = oData.Key05;
                  MessageBox.error(message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                  that.onButtonPress();
                  return;
                } else if (oData.Key04 === "I") {
                  var message = oData.Key05;
                  MessageBox.warning(message);
                  $(".sapMMessageToast").addClass("sapMMessageToastWarning");
                  that.PostActionDialog.close();
                  that.onButtonPress();
                  return;
                }
                else {
                  var message = oData.Key05;
                  MessageBox.success(message);
                  $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
                  that.PostActionDialog.close();
                  that.onButtonPress();
                }
                return;
              } catch (e) {
                // that.hidePostBusyIndicator();
                oGlobalBusyDialog.close();
                that.oInfoMessageDialog.close();
                MessageToast.show(e.message);
                $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
                that.onButtonPress();
              }
            }
          );
        },
        onAfterClosePostPress: function () {
          this.PostActionDialog.destroy(true);
        },
        onCancelPostPress: function () {
          var that = this;
          that.PostActionDialog.close();
          var Path = that.getView().getId();
        },
        onValueChange: function (oEvent) {

          var oInput = oEvent.getSource();
          var valu = oInput.getValue();
          valu = valu.replace(/[^\d.,-]/g, '');
          oInput.setValue(valu);
        },
        onPostQuantityChange: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();
          var value = sap.ui.getCore().byId(`idPostQuantity`).getValue();

          var Tableindex = "X";
          var SelAufnr = " ";
          var SelOprNo = " ";
          var SelPlant = " ";
          var OprNo = " ";

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

            OprNo = sap.ui
              .getCore()
              .byId(`${Path}--idInprogressOrderList`)
              .getModel("InProgressModel")
              .getData().InProgressData[Tableindex].Data16;
          }
          if (Tableindex === undefined) {
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Post001");
            MessageBox.error(message);
            return;
          }

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();

          var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
          var IEntry = {};
          IEntry.Key01 = "COMPONENTUPD";
          IEntry.Key02 = SelAufnr;
          IEntry.Key03 = value;
          IEntry.Key04 = SelOprNo;
          IEntry.Key05 = SelPlant;
          IEntry.ConfirmType = OprNo;
          IEntry.WorkCenterArea = " ";
          IEntry.NavWC_InProgress = [{}];
          IEntry.NavWC_Queue = [{}];
          IEntry.NavWC_Future = [{}];
          IEntry.NavWC_Component = [];
          if (sap.ui.getCore().byId("idPostComponentList101").getModel("ComponentModel101") != undefined) {
            var ComponentList101 = sap.ui
              .getCore()
              .byId("idPostComponentList101")
              .getModel("ComponentModel101")
              .getData().ComponentData101;
            if (ComponentList101.length != 0) {
              for (var i = 0; i in ComponentList101; i++) {
                IEntry.NavWC_Component.push(ComponentList101[i]);
              }
            }
          }
          if (sap.ui.getCore().byId("idPostComponentList261").getModel("ComponentModel261") != undefined) {
            var ComponentList261 = sap.ui
              .getCore()
              .byId("idPostComponentList261")
              .getModel("ComponentModel261")
              .getData().ComponentData261;

            if (ComponentList261.length != 0) {
              for (var i = 0; i in ComponentList261; i++) {
                IEntry.NavWC_Component.push(ComponentList261[i]);
              }
            }
          }
          if (sap.ui.getCore().byId("idPostComponentList561").getModel("ComponentModel561") != undefined) {
            var ComponentList561 = sap.ui
              .getCore()
              .byId("idPostComponentList561")
              .getModel("ComponentModel561")
              .getData().ComponentData561;
            if (ComponentList561.length != 0) {
              for (var i = 0; i in ComponentList561; i++) {
                IEntry.NavWC_Component.push(ComponentList561[i]);
              }
            }
          }



          if (IEntry.NavWC_Component.length === 0) {
            IEntry.NavWC_Component = [{}];
          }

          oDataModel.create(
            "/WorkCenter_AreaOrderSet",
            IEntry,
            null,
            function (oData, Response) {
              try {
                that.hideBusyIndicator();

                var ComponentData = oData.NavWC_Component.results;
                var ComponentDataLoop101 = [];
                var ComponentDataLoop261 = [];
                var ComponentDataLoop561 = [];
                if (ComponentData.length != 0) {
                  var ComponentnList101 = sap.ui.getCore().byId("idPostComponentList101");
                  var ComponentnList261 = sap.ui.getCore().byId("idPostComponentList261");
                  var ComponentnList561 = sap.ui.getCore().byId("idPostComponentList561");

                  var ComponentModel101 = new sap.ui.model.json.JSONModel();
                  var ComponentModel261 = new sap.ui.model.json.JSONModel();
                  var ComponentModel561 = new sap.ui.model.json.JSONModel();

                  var ComponentDataLoop = [];
                  for (var i = 0; i in ComponentData; i++) {
                    if (ComponentData[i].Data08 === "101") {
                      ComponentData[i].Data09 = false;
                    } else {
                      ComponentData[i].Data09 = true;
                    }
                    if (ComponentData[i].Data10 === "false") {
                      ComponentData[i].Data10 = false;
                      ComponentData[i].Data15 = false;
                    } else {
                      ComponentData[i].Data10 = true;
                      ComponentData[i].Data15 = true;
                    }
                    if (ComponentData[i].Data08 === "101") {
                      ComponentDataLoop101.push(ComponentData[i]);
                    }
                    else if (ComponentData[i].Data08 === "261") {
                      ComponentDataLoop261.push(ComponentData[i]);
                    }
                    else {
                      ComponentDataLoop561.push(ComponentData[i]);

                    }
                  }
                  if (ComponentDataLoop101.length != 0) {
                    ComponentModel101.setData({
                      ComponentData101: ComponentDataLoop101,
                    });

                    ComponentnList101.setModel(ComponentModel101, "ComponentModel101");
                  }
                  if (ComponentDataLoop261.length != 0) {
                    ComponentModel261.setData({
                      ComponentData261: ComponentDataLoop261,
                    });

                    ComponentnList261.setModel(ComponentModel261, "ComponentModel261");
                  }
                  if (ComponentDataLoop561.length != 0) {
                    ComponentModel561.setData({
                      ComponentData561: ComponentDataLoop561,
                    });

                    ComponentnList561.setModel(ComponentModel561, "ComponentModel561");
                  }
                }
              } catch (e) {
                that.hideBusyIndicator();
                MessageToast.show(e.message);
                $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
              }
            }
          );
        },
        onTableQueSelectionChange: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var StartDate;
          var EndDate;

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idQueueOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idQueueOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            // sap.ui
            //   .getCore()
            //   .byId(`${Path}--idInprogressOrderList`)
            //   .clearSelection();
            index = 0;
            StartDate = sap.ui
              .getCore()
              .byId(`${Path}--idQueueOrderList`)
              .getModel("InQueueModel")
              .getData().InQueueData[Tableindex].Data14;
          }
          if (Tableindex === undefined) {
            sap.ui.getCore().byId(`${Path}--idQUEStartJob`).setEnabled(false);
            // sap.ui.getCore().byId(`${Path}--idINPStartJob`).setEnabled(true);
          } else {
            sap.ui.getCore().byId(`${Path}--idQUEStartJob`).setEnabled(true);
          }
        },
        onTableRowSelectionChange: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var StartDate;
          var EndDate;
          var LinesSelected = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices();

          if (LinesSelected.length > 1) {
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Gen004");
            MessageBox.error(message);
            // sap.ui
            //   .getCore()
            //   .byId(`${Path}--idInprogressOrderList`)
            //   .clearSelection();
            return;
          }

          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idInprogressOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            var aIndices = this.getView()
              .byId(`${Path}--idInprogressOrderList`)
              .getBinding("rows").aIndices;
            for (var loop = 0; loop in aIndices; loop++) {
              if (loop === Tableindex) {
                Tableindex = aIndices[loop];
                break;
                console.log(Tableindex);
              }
            }

            // sap.ui.getCore().byId(`${Path}--idQueueOrderList`).clearSelection();
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
        },
        onBatchValidation: function (oEvent) {

          var that = this;
          var sId = oEvent.getParameter("id");
          var TableDetail = oEvent.getSource().getParent().sId;
          var LineArray = oEvent.getSource().getParent().getCells();
          var SelectedLine = oEvent.getSource().sId;
          var SelMatnr = " ";
          var SelWerks = sap.ui.getCore().byId("idSelectPostPlant").getValue();
          var SelLgort = "GI01";
          var SelBatch = oEvent.getParameter("newValue");
          //  var SelClabs = " ";
          //  var SelDesc = " ";

          //  if (LineArray.length != 0) {
          //    SelMatnr = LineArray[0].getProperty("value");
          //    SelDesc = LineArray[1].getProperty("text");
          //    SelClabs = LineArray[5].getProperty("value");

          //  }

          sap.ui.getCore().byId(SelectedLine).setValueState('None');

          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'BatchValidation' and Key02 eq '" +
            SelBatch + "' ",
            {
              context: null,
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {

                  if (oData.results.length != 0) {
                    var BatchData = oData.results;
                    sap.ui.getCore().byId(SelectedLine).setValueState('None');
                    sap.ui.getCore().byId(SelectedLine).setValue(BatchData[0].Data04);
                    that.hideBusyIndicator();
                  }

                  else {
                    that.hideBusyIndicator();
                    sap.ui.getCore().byId(SelectedLine).setValueState('Error');
                    sap.ui.getCore().byId(SelectedLine).setValue("");

                    var message = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("BatChk");
                    sap.ui.getCore().byId(SelectedLine).setValueStateText(message);

                  }

                }
                catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
                  // alert(e.message);
                }

              }

            }
          )

          // var that = this;
          // var oInput = oEvent.getSource();
          // var SelBatch  = oInput.getValue();

          //   oModel.read(
          //     "/ValueHelpSet?$filter=Key01 eq 'BatchValidation' and Key02 eq '" +
          //     SelBatch + "' ",
          //     {
          //      context: null,
          //       async: false,
          //       urlParameters: null,
          //       success: function (oData, oResponse) {
          //         try {
          //           
          //           if (oData.results.length === 0) {
          //             const isInvalid = "Invalid"
          //             oInput.setValueState(isInvalid ? "Error" : "None");

          //           //   var message = that
          //           //   .getView()
          //           //   .getModel("i18n")
          //           //   .getResourceBundle()
          //           //   .getText("BOM002");
          //           // MessageToast.show(message);

          //           } 
          //         }
          //          catch (e) {
          //           MessageToast.show(e.message);
          //           $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
          //           // alert(e.message);
          //         }
          //       }

          //    });

        },

        onBatchHelpRequest: function (oEvent) {
          var that = this;
          var sId = oEvent.getParameter("id");
          var TableDetail = oEvent.getSource().getParent().sId;
          var LineArray = oEvent.getSource().getParent().getCells();
          var SelMatnr = " ";
          var SelWerks = sap.ui.getCore().byId("idSelectPostPlant").getValue();
          var SelLgort = "GI01";
          var SelClabs = " ";
          var SelDesc = " ";
          if (LineArray.length != 0) {
            SelMatnr = LineArray[0].getProperty("value");
            SelDesc = LineArray[1].getProperty("text");
            // SelWerks = LineArray[2].getProperty("text");
            // SelLgort = LineArray[3].getProperty("text");
            SelClabs = LineArray[5].getProperty("value");
          }
          TableBatchGlobalId = TableDetail;
          var Path = that.getView().getId();

          if (!that.BatchHelpDialog) {
            that.BatchHelpDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.BatchHelpDialog",
              that
            );
            that.getView().addDependent(that.BatchHelpDialog);
          }
          that.showBusyIndicator();

          sBatchId = sId;
          var Title = that
            .getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("Gen006");
          sap.ui.getCore().byId('idBatchDialog').setTitle(Title + ' - ' + SelDesc)

          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'BatchValue' and Key02 eq '" +
            SelMatnr +
            "' and Key03 eq '" +
            SelWerks +
            "' and Key04 eq '" +
            SelLgort +
            "' and Key05 eq '" +
            SelClabs +
            "'",
            {
              context: null,
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  if (oData.results.length != 0) {
                    var BatchData = oData.results;
                    if (BatchData.length != 0) {
                      var BatchModel = new sap.ui.model.json.JSONModel();

                      BatchModel.setData({
                        BatchData: BatchData,
                      });
                      var BatchList = sap.ui.getCore().byId("idBatchDialog");

                      BatchList.setModel(BatchModel, "BatchModel");
                    }
                    that.hideBusyIndicator();
                    that.BatchHelpDialog.open();
                  } else {
                    that.hideBusyIndicator();
                    // Raise Message
                    var message = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("BOM002");
                    MessageToast.show(message);
                  }
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
                  // alert(e.message);
                }
              },
            }
          );
        },
        onBatchInputChange: function (oEvent) {
          var that = this;
          if (oEvent.getParameters().selectedItems != undefined) {
            var Batch = oEvent
              .getParameters()
              .selectedItem.getCells()[3]
              .getText();
            var Component = oEvent
              .getParameters()
              .selectedItem.getCells()[0]
              .getTitle();
            var Plant = oEvent
              .getParameters()
              .selectedItem.getCells()[1]
              .getText();
            var Location = oEvent
              .getParameters()
              .selectedItem.getCells()[2]
              .getText();
            var Fid = "";
            Fid = sap.ui.getCore().byId(TableBatchGlobalId).getCells()[3].sId;
            if (Fid != "") {
              if (Fid != undefined) {
                sap.ui.getCore().byId(Fid).setValueState('None');
                sap.ui.getCore().byId(Fid).setValueStateText('');
              }
            }


            var SelTable = TableBatchGlobalId.split("-");
            if (SelTable.length != 0) {
              var SelTableLine = SelTable[0];
            }

            if (SelTableLine === "idPostComponentList101") {

              var HelpBatchPath = sap.ui.getCore().byId(sBatchId).getParent().oBindingContexts.ComponentModel101.sPath;
              var BatchLineArray = HelpBatchPath.split("/");
              var BatchLineUpdate = parseInt(BatchLineArray[2]);
              var ComponentData = [];
              var ComponentDataLine = {};
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList101")
                .getModel("ComponentModel101")
                .getData().ComponentData101;
            }
            if (SelTableLine === "idPostComponentList261") {

              var HelpBatchPath = sap.ui.getCore().byId(sBatchId).getParent().oBindingContexts.ComponentModel261.sPath;
              var BatchLineArray = HelpBatchPath.split("/");
              var BatchLineUpdate = parseInt(BatchLineArray[2]);
              var ComponentData = [];
              var ComponentDataLine = {};
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList261")
                .getModel("ComponentModel261")
                .getData().ComponentData261;
            }
            if (SelTableLine === "idPostComponentList561") {

              var HelpBatchPath = sap.ui.getCore().byId(sBatchId).getParent().oBindingContexts.ComponentModel561.sPath;
              var BatchLineArray = HelpBatchPath.split("/");
              var BatchLineUpdate = parseInt(BatchLineArray[2]);
              var ComponentData = [];
              var ComponentDataLine = {};
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList561")
                .getModel("ComponentModel561")
                .getData().ComponentData561;
            }
            for (var ind = 0; ind < ComponentTable.length; ind++) {
              ComponentDataLine = ComponentTable[ind];
              if (BatchLineUpdate === ind) {
                ComponentDataLine.Data05 = Batch;
              }
              ComponentData.push(ComponentDataLine);
            }
            if (SelTableLine === "idPostComponentList101") {
              sap.ui
                .getCore()
                .byId("idPostComponentList101")
                .getModel("ComponentModel101")
                .setData({ ComponentData101: ComponentData });
            }
            if (SelTableLine === "idPostComponentList261") {
              sap.ui
                .getCore()
                .byId("idPostComponentList261")
                .getModel("ComponentModel261")
                .setData({ ComponentData261: ComponentData });
            }
            if (SelTableLine === "idPostComponentList561") {
              sap.ui
                .getCore()
                .byId("idPostComponentList561")
                .getModel("ComponentModel561")
                .setData({ ComponentData561: ComponentData });
            }
          }
        },
        onUOMInputClose: function () {
          return;
        },
        onBatchInputClose: function () {
          // this.BatchHelpDialog.close();
          return;
        },
        onMaterialInputClose: function () {
          return;
        },
        onMaterialHelpInputClose: function () {
          return;
        },
        onProdSuppAreaInputClose: function () {
          return;
        },
        onidInputWorkAreaLiveChange: function (oEvent) {
          // Validate User Entered Input
          var that = this;
          var Path = that.getView().getId();
          var WorkcenterArea = oEvent.getParameters().newValue;
          var Workcenter = "";
          var Plant = sap.ui
            .getCore()
            .byId(Path + "--idInputPlant")
            .getValue();

          if (Plant != " ") {
            sap.ui
              .getCore()
              .byId(Path + "--idInputWorkCenter")
              .setValue(Workcenter);
            sap.ui
              .getCore()
              .byId(Path + "--idTextWorkArea")
              .setText(WorkcenterArea);
            sap.ui
              .getCore()
              .byId(Path + "--idTextWorkCenter")
              .setText(Workcenter);

            that.onLoadData(that, Plant, WorkcenterArea, Workcenter);
          }
        },
        onidScarpPostReasonChange: function (oEvent) {

          var that = this;
          var Path = that.getView().getId();
          var sId = oEvent.getParameter("id");
          var ScrapReason = oEvent.getParameters().newValue;
          var ScarpText = " ";
          ScrapReason = ScrapReason.toUpperCase();
          var Plant = sap.ui
            .getCore()
            .byId(Path + "--idInputPlant")
            .getValue();
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
          sPostReasonCodeId = sId;
          var ind = 0;
          var ScarpData = sap.ui
            .getCore()
            .byId("idPostScarpList")
            .getModel("PostScarpModel")
            .getData().PostScarpData;

          for (var i = 0; i < ScarpData.length; i++) {
            // Line Already Available in Table so need to updated in that Line
            if (ScarpData[i].Data06 === ScrapReason) {
              ind = parseInt(ind) + 1;

            }
          }
          if (ind > 1) {
            sap.ui.getCore().byId(sPostReasonCodeId).setValue("");
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Gen005");
            MessageToast.show(message);
            $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
            return;
          }
          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'ScrapReason' and Key02 eq '" +
            Plant +
            "'",
            {
              context: null,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  var ScarpReasonData = oData.results;
                  // sReasonCodeId
                  var HelpReasonCodePath = sap.ui.getCore().byId(sPostReasonCodeId).getParent().oBindingContexts.PostScarpModel.sPath;
                  var HelpReasonCodeArray = HelpReasonCodePath.split("/");
                  var HelpReasonCodeUpdate = parseInt(HelpReasonCodeArray[2]);
                  for (var i = 0; i in ScarpReasonData; i++) {
                    if (ScarpReasonData[i].Data03 === ScrapReason) {
                      ScarpText = ScarpReasonData[i].Data04;
                      var Counter = true;
                    }
                  }
                  if (Counter != true) {
                    // Raise Error Message with State
                    sap.ui
                      .getCore()
                      .byId(sPostReasonCodeId)
                      .setValueState("Error");
                    sap.ui.getCore().byId(sPostReasonCodeId).setValue("");

                    // Get Message
                    var Emessage = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("Scarp004");
                    sap.ui
                      .getCore()
                      .byId(sPostReasonCodeId)
                      .setValueStateText(Emessage);
                  } else {
                    // Clear Error State
                    sap.ui
                      .getCore()
                      .byId(sPostReasonCodeId)
                      .setValueState("None");
                    sap.ui
                      .getCore()
                      .byId(sPostReasonCodeId)
                      .setValueStateText("");
                    sap.ui
                      .getCore()
                      .byId(sPostReasonCodeId)
                      .setValue(ScrapReason);
                    // ScarpText
                    var ScarpTable = [];
                    var ScarpData = sap.ui
                      .getCore()
                      .byId("idPostScarpList")
                      .getModel("PostScarpModel")
                      .getData().PostScarpData;
                    for (var j = 0; j < ScarpData.length; j++) {
                      if (ScarpData[j].Data06 === ScrapReason) {
                        ScarpData[j].Data07 = ScarpText;
                      }
                      ScarpTable.push(ScarpData[j]);
                    }
                    // Update Table to Screen
                    sap.ui
                      .getCore()
                      .byId("idPostScarpList")
                      .getModel("PostScarpModel")
                      .setData({ PostScarpData: ScarpTable });
                  }
                } catch (e) {
                  alert(e.message);
                }
              },
            }
          );

        },
        onidScarpReasonChange: function (oEvent) {
          var that = this;
          var Path = that.getView().getId();
          var sId = oEvent.getParameter("id");
          var ScrapReason = oEvent.getParameters().newValue;
          var ScarpText = " ";
          ScrapReason = ScrapReason.toUpperCase();
          var Plant = sap.ui
            .getCore()
            .byId(Path + "--idInputPlant")
            .getValue();
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
          sReasonCodeId = sId;
          var ind = 0;
          var ScarpData = sap.ui
            .getCore()
            .byId("idScarpList")
            .getModel("ScarpModel")
            .getData().ScarpData;

          for (var i = 0; i < ScarpData.length; i++) {
            // Line Already Available in Table so need to updated in that Line
            if (ScarpData[i].Data06 === ScrapReason) {
              ind = parseInt(ind) + 1;
            }
          }
          if (ind > 1) {
            sap.ui.getCore().byId(sReasonCodeId).setValue("");
            var message = that
              .getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("Gen005");
            MessageToast.show(message);
            $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
            return;
          }
          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'ScrapReason' and Key02 eq '" +
            Plant +
            "'",
            {
              context: null,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  var ScarpReasonData = oData.results;
                  // sReasonCodeId
                  var HelpReasonCodePath = sap.ui.getCore().byId(sReasonCodeId).getParent().oBindingContexts.ScarpModel.sPath;
                  var HelpReasonCodeArray = HelpReasonCodePath.split("/");
                  var HelpReasonCodeUpdate = parseInt(HelpReasonCodeArray[2]);
                  for (var i = 0; i in ScarpReasonData; i++) {
                    if (ScarpReasonData[i].Data03 === ScrapReason) {
                      ScarpText = ScarpReasonData[i].Data04;
                      var Counter = true;
                    }
                  }
                  if (Counter != true) {
                    // Raise Error Message with State
                    sap.ui
                      .getCore()
                      .byId(sReasonCodeId)
                      .setValueState("Error");
                    sap.ui.getCore().byId(sReasonCodeId).setValue("");

                    // Get Message
                    var Emessage = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("Scarp004");
                    sap.ui
                      .getCore()
                      .byId(sReasonCodeId)
                      .setValueStateText(Emessage);
                  } else {
                    // Clear Error State
                    sap.ui
                      .getCore()
                      .byId(sReasonCodeId)
                      .setValueState("None");
                    sap.ui
                      .getCore()
                      .byId(sReasonCodeId)
                      .setValueStateText("");
                    sap.ui
                      .getCore()
                      .byId(sReasonCodeId)
                      .setValue(ScrapReason);
                    // ScarpText
                    var ScarpTable = [];
                    var ScarpData = sap.ui
                      .getCore()
                      .byId("idScarpList")
                      .getModel("ScarpModel")
                      .getData().ScarpData;
                    for (var j = 0; j < ScarpData.length; j++) {
                      if (ScarpData[j].Data06 === ScrapReason) {
                        ScarpData[j].Data07 = ScarpText;
                      }
                      ScarpTable.push(ScarpData[j]);
                    }
                    // Update Table to Screen
                    sap.ui
                      .getCore()
                      .byId("idScarpList")
                      .getModel("ScarpModel")
                      .setData({ ScarpData: ScarpTable });
                  }
                } catch (e) {
                  alert(e.message);
                }
              },
            }
          );
        },
        onidInputWorkCenterLiveChange: function (oEvent) {
          // Validate User Entered Input
          var that = this;
          var Path = that.getView().getId();
          var Workcenter = oEvent.getParameters().newValue;
          var Plant = sap.ui
            .getCore()
            .byId(Path + "--idInputPlant")
            .getValue();

          var WorkcenterArea = sap.ui
            .getCore()
            .byId(Path + "--idInputWorkArea")
            .getValue();

          sap.ui
            .getCore()
            .byId(Path + "--idInputWorkCenter")
            .setValue(Workcenter);
          sap.ui
            .getCore()
            .byId(Path + "--idTextWorkCenter")
            .setText(Workcenter);

          if (Plant != " ") {
            that.onLoadData(that, Plant, WorkcenterArea, Workcenter);
          }
        },
        onScanSuccess: function (oEvent) {
          if (oEvent.getParameter("cancelled")) {
            MessageToast.show("Scan cancelled", { duration: 1000 });
          } else {
            if (oEvent.getParameter("text")) {
              oScanResultText.setText(oEvent.getParameter("text"));
              sap.ui
                .getCore()
                .byId(Path + "--idTextProdOrdNo")
                .setText(oEvent.getParameter("text"));

              sap.ui
                .getCore()
                .byId(Path + "--idInputProdOrdNo")
                .setValue(oEvent.getParameter("text"));
            } else {
              oScanResultText.setText("");
            }
          }
        },

        onScanError: function (oEvent) {
          MessageToast.show("Scan failed: " + oEvent, { duration: 1000 });
        },

        onScanLiveupdate: function (oEvent) {
          // User can implement the validation about inputting value
        },
        onidInputProdOrdNoLiveChange: function (oEvent) {
          // Validate User Entered Input
          var that = this;
          var Path = that.getView().getId();
          var OrderNo = oEvent.getParameters().newValue;
          var Plant = sap.ui
            .getCore()
            .byId(Path + "--idInputPlant")
            .getValue();
          var Workcenter = sap.ui
            .getCore()
            .byId(Path + "--idInputWorkCenter")
            .getValue();
          var WorkcenterArea = sap.ui
            .getCore()
            .byId(Path + "--idInputWorkArea")
            .getValue();

          sap.ui
            .getCore()
            .byId(Path + "--idTextProdOrdNo")
            .setText(OrderNo);

          sap.ui
            .getCore()
            .byId(Path + "--idInputProdOrdNo")
            .setValue(OrderNo);

          if (Plant != " ") {
            that.onLoadData(that, Plant, WorkcenterArea, Workcenter);
          }
        },
        onidInputComponentSelLiveChange: function (oEvent) {
          // Validate User Entered Input
          var that = this;
          var Path = that.getView().getId();
          var ComponentNo = oEvent.getParameters().newValue;
          var Plant = sap.ui
            .getCore()
            .byId(Path + "--idInputPlant")
            .getValue();
          var Workcenter = sap.ui
            .getCore()
            .byId(Path + "--idInputWorkCenter")
            .getValue();
          var WorkcenterArea = sap.ui
            .getCore()
            .byId(Path + "--idInputWorkArea")
            .getValue();

          sap.ui
            .getCore()
            .byId(Path + "--idInputComponentSelNo")
            .setValue(ComponentNo);

          if (Plant != " ") {
            that.onLoadData(that, Plant, WorkcenterArea, Workcenter);
          }
        },
        _initialData: {
          columns: [
            {
              visible: true,
              name: "Data02",
              label: "{i18n>ProdItmNo}",
            },
            {
              visible: false,
              name: "Data17",
              label: "{i18n>StomerField1}",
            },
            {
              visible: false,
              name: "Key02",
              label: "{i18n>SeqNum}",
            },
          ],
          sort: [
            {
              sorted: true,
              name: "Data02",
              label: "{i18n>ProdItmNo}",
              descending: true,
            },
            {
              sorted: false,
              name: "Data17",
              label: "{i18n>StomerField1}",
              descending: false,
            },
            {
              sorted: false,
              name: "Key02",
              label: "{i18n>SeqNum}",
              descending: false,
            },
          ],
          group: [
            {
              grouped: true,
              name: "Data02",
              label: "{i18n>ProdItmNo}",
            },
            {
              grouped: false,
              name: "Data17",
              label: "{i18n>StomerField1}",
            },
            {
              grouped: false,
              name: "Key02",
              label: "{i18n>SeqNum}",
            },
          ],
        },
        _setInitialData: function () {
          const oView = this.getView();

          const oSelectionPanel = oView.byId("columnsPanel");
          // const oSortPanel = oView.byId("sortPanel");
          // const oGroupPanel = oView.byId("groupPanel");

          oSelectionPanel.setP13nData(this._initialData.columns);
          // oSortPanel.setP13nData(this._initialData.sort);
          // oGroupPanel.setP13nData(this._initialData.group);
        },

        onContainerOpen: function (oEvt) {
          const oView = this.getView();
          const oPopup = oView.byId("p13nPopup");
          if (!this._bIsOpen) {
            this._setInitialData();
            this._bIsOpen = true;
          }

          oPopup.open(oEvt.getSource());
        },

        onClose: function (oEvt) {
          const sReason = oEvt.getParameter("reason");
          MessageToast.show("Dialog close reason: " + sReason);
        },

        reset: function (oEvt) {
          this._setInitialData();
          this.parseP13nState();
        },
        parseP13nState: function (oEvt) {
          if (oEvt) {
            MessageToast.show(
              "P13n panel change reason:" + oEvt.getParameter("reason")
            );
          }

          const oView = this.getView();
          const oEditor = oView.byId("p13nEditor");

          const oP13nState = {
            columns: oView.byId("columnsPanel").getP13nData(),
            sort: oView.byId("sortPanel").getP13nData(),
            group: oView.byId("groupPanel").getP13nData(),
          };

          oEditor.setValue(JSON.stringify(oP13nState, null, "  "));
        },
        handleSettingsButtonPressed: function (oEvt) {
          var that = this;
          var Path = that.getView().getId();
          const oTable = this.byId(Path + "--idInprogressOrderList");
          Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
            contentHeight: "35rem",
            contentWidth: "32rem",
            source: oEvt.getSource(),
          });
        },
        onPostBinDetHelpRequest: function (oEvent) {
          var that = this;
          var Path = that.getView().getId();
          var sId = oEvent.getParameter("id");
          var TableDetail = oEvent.getSource().getParent().sId;
          var FillBin = oEvent.getSource().sId;

          sap.ui.getCore().byId(FillBin).setValueState('None');
          sap.ui.getCore().byId(FillBin).setValueStateText('');

          TableBinGlobalId = TableDetail;
          sBinSelLineId = sId;

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          if (SelPlant === null) {
            SelPlant = "DKKV";
          }

          if (!that.BinDialog) {
            that.BinDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.HelpBin",
              that
            );
            that.getView().addDependent(that.WCDialog);
          }
          // open value help dialog
          that.BinDialog.open();
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'Bin' and Key04 eq '" +
            SelPlant +
            "'",
            {
              context: null,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  var Path = that.getView().getId();
                  var BinData = oData.results;
                  var BinModel = new sap.ui.model.json.JSONModel();

                  BinModel.setData({
                    BinData: BinData,
                  });
                  var BinTable = sap.ui.getCore().byId("idHelpBinDialog");

                  BinTable.setModel(BinModel, "BinModel");
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
                }
              },
            }
          );
        },

        _onHelpBinSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter("Data01", FilterOperator.Contains, sValue);
          var oBinding = oEvent.getParameter("itemsBinding");
          oBinding.filter([oFilter]);
        },

        _HelpBinSelect: function (oEvent) {
          var that = this;
          if (oEvent.getParameters().selectedItems != undefined) {
            var BinDet = oEvent.getParameters().selectedItems[0].getTitle();
            if (BinDet != undefined) {
              // if (oEvent.getParameters().selectedItems != undefined) {

              var Array = TableBinGlobalId.split('-');
              if (Array.length != 0) {
                var SelTablId = Array[0];
              } else {
                return;
              }
              if (SelTablId === 'idPostComponentList101') {
                var ComponentTable = sap.ui
                  .getCore()
                  .byId("idPostComponentList101")
                  .getModel("ComponentModel101")
                  .getData().ComponentData101;
                var HelpBinAreaPath = sap.ui
                  .getCore()
                  .byId(sBinSelLineId)
                  .getParent().oBindingContexts.ComponentModel101.sPath;
              }
              var HelpBinAreaArray = HelpBinAreaPath.split("/");
              var HelpBinAreaUpdate = parseInt(HelpBinAreaArray[2]);

              for (var ind = 0; ind < ComponentTable.length; ind++) {
                if (HelpBinAreaUpdate === ind) {
                  ComponentTable[ind].Data12 = BinDet;
                }
              }
              if (SelTablId === 'idPostComponentList101') {
                sap.ui
                  .getCore()
                  .byId("idPostComponentList101")
                  .getModel("ComponentModel101")
                  .setData({ ComponentData101: ComponentTable });
              }
              // }
              // sap.ui.getCore().byId(`idPostBinDet`).setValue(BinDet);

              // oEvent.getSource().getBinding("items").filter([]);
            } else {
              return;
            }
          }
        },
        onScarpPostAdd: function () {
          var PostScarpData = sap.ui
            .getCore()
            .byId("idPostScarpList")
            .getModel("PostScarpModel")
            .getData().PostScarpData;

          var line = {
            Data01: "",
            Data02: "",
            Data03: "",
            Data04: "",
            Data05: "",
            Data06: "",
            Data07: "",
            Data08: "",
            Data09: "",
            Data10: "",
            Data11: "",
            Data12: "",
            Data13: "",
            Data14: "",
            Data15: "",
            Data16: "",
            Data17: "",
            Data18: "",
            Data19: "",
            Data20: "",
            Key01: "Scarp",
            Key02: "",
            Key03: "N",
            Key04: "2",
            Key05: "",
          };
          PostScarpData.push(line);

          var PostScarpModel = new sap.ui.model.json.JSONModel();

          PostScarpModel.setData({
            PostScarpData: PostScarpData,
          });
          var ScarpList = sap.ui.getCore().byId("idPostScarpList");

          ScarpList.setModel(PostScarpModel, "PostScarpModel");
        },

        onScarpCompAdd: function () {
          var ScarpData = sap.ui
            .getCore()
            .byId("idScarpList")
            .getModel("ScarpModel")
            .getData().ScarpData;

          var line = {
            Data01: "",
            Data02: "",
            Data03: "",
            Data04: "",
            Data05: "",
            Data06: "",
            Data07: "",
            Data08: "",
            Data09: "",
            Data10: "",
            Data11: "",
            Data12: "",
            Data13: "",
            Data14: "",
            Data15: "",
            Data16: "",
            Data17: "",
            Data18: "",
            Data19: "",
            Data20: "",
            Key01: "Scarp",
            Key02: "",
            Key03: "N",
            Key04: "2",
            Key05: "",
          };
          ScarpData.push(line);

          var ScarpModel = new sap.ui.model.json.JSONModel();

          ScarpModel.setData({
            ScarpData: ScarpData,
          });
          var ScarpList = sap.ui.getCore().byId("idScarpList");

          ScarpList.setModel(ScarpModel, "ScarpModel");
        },

        onPostCompAdd101: function (oEvent) {
          var ComponentData = sap.ui
            .getCore()
            .byId("idPostComponentList101")
            .getModel("ComponentModel101")
            .getData().ComponentData101;

          var line = {
            Data01: " ",
            Data02: "",
            Data03: "DKKV",
            Data04: "GI01",
            Data05: "",
            Data06: "",
            Data07: "",
            Data08: "101",
            Data09: true,
            Data10: true,
            Data11: "",
            Data12: "",
            Data13: "",
            Data14: "",
            Data15: true,
            Data16: "",
            Data17: "",
            Data18: "",
            Data19: "",
            Data20: "",
            Key01: "Component",
            Key02: "",
            Key03: "N",
            Key04: "2",
            Key05: "",
          };
          ComponentData.push(line);

          var ComponentModel101 = new sap.ui.model.json.JSONModel();

          ComponentModel101.setData({
            ComponentData101: ComponentData,
          });
          var ComponentnList = sap.ui.getCore().byId("idPostComponentList101");

          ComponentnList.setModel(ComponentModel101, "ComponentModel101");
        },
        onPostCompAdd261: function (oEvent) {
          var ComponentData = sap.ui
            .getCore()
            .byId("idPostComponentList261")
            .getModel("ComponentModel261")
            .getData().ComponentData261;

          var line = {
            Data01: " ",
            Data02: "",
            Data03: "DKKV",
            Data04: "GI01",
            Data05: "",
            Data06: "",
            Data07: "",
            Data08: "261",
            Data09: true,
            Data10: true,
            Data11: "",
            Data12: "",
            Data13: "",
            Data14: "",
            Data15: true,
            Data16: "",
            Data17: "",
            Data18: "",
            Data19: "",
            Data20: "",
            Key01: "Component",
            Key02: "",
            Key03: "N",
            Key04: "2",
            Key05: "",
          };
          ComponentData.push(line);

          var ComponentModel261 = new sap.ui.model.json.JSONModel();

          ComponentModel261.setData({
            ComponentData261: ComponentData,
          });
          var ComponentnList = sap.ui.getCore().byId("idPostComponentList261");

          ComponentnList.setModel(ComponentModel261, "ComponentModel261");
        },
        onPostCompAdd561: function (oEvent) {
          var ComponentData = sap.ui
            .getCore()
            .byId("idPostComponentList561")
            .getModel("ComponentModel561")
            .getData().ComponentData561;

          var line = {
            Data01: " ",
            Data02: "",
            Data03: "DKKV",
            Data04: "GI01",
            Data05: "",
            Data06: "",
            Data07: "",
            Data08: "",
            Data09: true,
            Data10: true,
            Data11: "",
            Data12: "",
            Data13: "",
            Data14: "",
            Data15: true,
            Data16: "",
            Data17: "",
            Data18: "",
            Data19: "",
            Data20: "",
            Key01: "Component",
            Key02: "",
            Key03: "N",
            Key04: "2",
            Key05: "",
          };
          ComponentData.push(line);

          var ComponentModel561 = new sap.ui.model.json.JSONModel();

          ComponentModel561.setData({
            ComponentData561: ComponentData,
          });
          var ComponentnList = sap.ui.getCore().byId("idPostComponentList561");

          ComponentnList.setModel(ComponentModel561, "ComponentModel561");
        },
        _onComponentSelHelp: function (oEvent) {
          var that = this;
          var Path = that.getView().getId();
          var SelWerks = " ";
          var SelLgort = " ";

          SelWerks = sap.ui.getCore().byId(`${Path}--idInputPlant`).getValue();

          if (!that.MaterialHelpDialog) {
            that.MaterialHelpDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.HelpMaterialDialog",
              that
            );
            that.getView().addDependent(that.MaterialHelpDialog);
          }
          that.showBusyIndicator();

          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'Material' and Key02 eq '" +
            SelWerks +
            "' and Key03 eq '" +
            SelLgort +
            "' and Key04 eq 'Header'",
            {
              context: null,
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  if (oData.results.length != 0) {
                    var MaterialData = oData.results;
                    if (MaterialData.length != 0) {
                      var MaterialModel = new sap.ui.model.json.JSONModel();

                      MaterialModel.setData({
                        MaterialData: MaterialData,
                      });
                      var MaterialList = sap.ui
                        .getCore()
                        .byId("idHelpMaterialDialog");

                      MaterialList.setModel(MaterialModel, "MaterialModel");
                    }
                    that.hideBusyIndicator();
                    that.MaterialHelpDialog.open();
                  } else {
                    that.hideBusyIndicator();
                    // Raise Message
                    var message = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("BOM002");
                    MessageToast.show(message);
                    $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                  }
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                  // alert(e.message);
                }
              },
            }
          );
        },
        onSupplyAreaChange: function (oEvent) {
          var that = this;
          var Path = that.getView().getId();
          var LineArray = oEvent.getSource().getParent().getCells();
          var SelSupplyArea = oEvent.getParameter("newValue");
          var FillSupplyArea = oEvent.getSource().sId;

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          if (SelPlant === null) {
            SelPlant = "DKKV";
          }
          sap.ui.getCore().byId(FillSupplyArea).setValueState('None');
          sap.ui.getCore().byId(FillSupplyArea).setValueStateText('');

          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
          oModel.read("/ValueHelpSet?$filter=Key01 eq 'SupplyArea'", {
            context: null,
            async: false,
            urlParameters: null,
            success: function (oData, oResponse) {
              try {
                if (oData.results.length != 0) {
                  var SupplyAreaData = oData.results;
                  if (SupplyAreaData.length != 0) {
                    for (var i = 0; i in SupplyAreaData; i++) {
                      if (SupplyAreaData[i].Data01 === SelSupplyArea) {
                        var FillSupArea = SupplyAreaData[i].Data01;
                        break;
                      }
                    }
                    if (FillSupArea === SelSupplyArea) {
                      sap.ui.getCore().byId(FillSupplyArea).setValueState('None');
                      sap.ui.getCore().byId(FillSupplyArea).setValue(FillSupArea);
                    }
                    else {
                      sap.ui.getCore().byId(FillSupplyArea).setValueState('Error');
                      sap.ui.getCore().byId(FillSupplyArea).setValue("");
                      // Raise Message
                      var message = that
                        .getView()
                        .getModel("i18n")
                        .getResourceBundle()
                        .getText("SupplyAreaChk");
                      sap.ui.getCore().byId(FillSupplyArea).setValueStateText(message);
                    }
                  }
                  that.hideBusyIndicator();
                }
              } catch (e) {
                MessageToast.show(e.message);
                $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                // alert(e.message);
              }
            },
          }
          );
        },
        onPostBinDetChange: function (oEvent) {
          var that = this;
          var Path = that.getView().getId();
          var LineArray = oEvent.getSource().getParent().getCells();
          var SelBin = oEvent.getParameter("newValue");
          var FillBin = oEvent.getSource().sId;

          var SelPlant = sap.ui
            .getCore()
            .byId(`${Path}--idInputPlant`)
            .getValue();
          if (SelPlant === null) {
            SelPlant = "DKKV";
          }
          sap.ui.getCore().byId(FillBin).setValueState('None');
          sap.ui.getCore().byId(FillBin).setValueStateText('');

          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'Bin' and Key02 eq '" +
            SelBin +
            "' and Key04 eq '" +
            SelPlant +
            "'",
            {
              context: null,
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  if (oData.results.length != 0) {
                    var BinData = oData.results;
                    if (BinData.length != 0) {
                      sap.ui.getCore().byId(FillBin).setValueState('None');
                      sap.ui.getCore().byId(FillBin).setValue(BinData[0].Data01);
                    }
                    that.hideBusyIndicator();
                  } else {
                    that.hideBusyIndicator();
                    sap.ui.getCore().byId(FillBin).setValueState('Error');
                    sap.ui.getCore().byId(FillBin).setValue("");
                    // Raise Message
                    var message = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("BinChk");
                    sap.ui.getCore().byId(FillBin).setValueStateText(message);
                  }
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                  // alert(e.message);
                }
              },
            }
          );
        },
        onUOMHelpPostRequest: function (oEvent) {
          var that = this;
          // var sId = oEvent.getParameter("id");
          var TableDetail = oEvent.getSource().getParent().sId;
          var LineArray = oEvent.getSource().getParent().getCells();
          var SelMatnr = " ";
          var UOMValue = " ";
          if (LineArray.length != 0) {
            SelMatnr = LineArray[0].getProperty("value");
          }
          var UOMValue = oEvent.getParameter("newValue");
          var Path = that.getView().getId();

          if (!that.UOMHelpDialog) {
            that.UOMHelpDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.UOMHelpDialog",
              that
            );
            that.getView().addDependent(that.UOMHelpDialog);
          }
          that.showBusyIndicator();
          TableUOMGlobalId = TableDetail;

          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'UOM' and Key02 eq '" +
            UOMValue +
            "' and Key03 eq '" +
            SelMatnr +
            "'",
            {
              context: null,
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  if (oData.results.length != 0) {
                    var UOMData = oData.results;
                    if (UOMData.length != 0) {
                      var UOMModel = new sap.ui.model.json.JSONModel();

                      UOMModel.setData({
                        UOMData: UOMData,
                      });
                      var UOMList = sap.ui
                        .getCore()
                        .byId("idUOMDialog");

                      UOMList.setModel(UOMModel, "UOMModel");
                    }
                    that.hideBusyIndicator();
                    that.UOMHelpDialog.open();
                  } else {
                    that.hideBusyIndicator();
                    // Raise Message
                    var message = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("BOM002");
                    MessageToast.show(message);
                    $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                  }
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                  // alert(e.message);
                }
              },
            }
          );
        },
        onUOMPostValidation: function (oEvent) {
          var that = this;
          var LineArray = oEvent.getSource().getParent().getCells();
          var SelUOM = oEvent.getParameter("newValue");
          var SelectedLine = oEvent.getSource().sId;
          var SelWerks = sap.ui.getCore().byId("idSelectPostPlant").getValue();
          var SelMatnr = " ";
          if (LineArray.length != 0) {
            SelMatnr = LineArray[0].getProperty("value");
          }
          sap.ui.getCore().byId(SelectedLine).setValueState('None');
          sap.ui.getCore().byId(SelectedLine).setValueStateText('');
          sap.ui.getCore().byId(SelectedLine).setEnabled(true);

          var Path = that.getView().getId();

          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'UOM' and Key02 eq '" +
            SelUOM +
            "' and Key03 eq '" +
            SelMatnr +
            "'",
            {
              context: null,
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  if (oData.results.length != 0) {
                    var UOMData = oData.results;
                    if (UOMData.length != 0) {
                      sap.ui.getCore().byId(SelectedLine).setValueState('None');
                      sap.ui.getCore().byId(SelectedLine).setValue(UOMData[0].Data01);
                      sap.ui.getCore().byId(SelectedLine).setEnabled(true);

                    }
                    that.hideBusyIndicator();
                  } else {
                    that.hideBusyIndicator();
                    sap.ui.getCore().byId(SelectedLine).setValueState('Error');
                    sap.ui.getCore().byId(SelectedLine).setValue("");
                    // Raise Message
                    var message = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("UOMChk");
                    sap.ui.getCore().byId(SelectedLine).setValueStateText(message);
                  }
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                  // alert(e.message);
                }
              },
            }
          );
        },
        onMaterailChangesPost: function (oEvent) {
          var that = this;
          var LineArray = oEvent.getSource().getParent().getCells();
          var SelMaterial = oEvent.getParameter("newValue");
          var SelectedLine = oEvent.getSource().sId;
          var SelWerks = sap.ui.getCore().byId("idSelectPostPlant").getValue();
          var SelLgort = "GI01";
          if (LineArray.length != 0) {
            var FillDescrption = LineArray[1].sId;
            var FillUOM = LineArray[5].sId;
            sap.ui.getCore().byId(SelectedLine).setValueState('None');
            sap.ui.getCore().byId(SelectedLine).setValueStateText('');
            sap.ui.getCore().byId(FillUOM).setEnabled(true);
          }

          var Path = that.getView().getId();

          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'Material' and Key02 eq '" +
            SelWerks +
            "' and Key03 eq '" +
            SelLgort +
            "' and Key05 eq '" +
            SelMaterial +
            "'",
            {
              context: null,
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  if (oData.results.length != 0) {
                    var MaterialData = oData.results;
                    if (MaterialData.length != 0) {
                      sap.ui.getCore().byId(SelectedLine).setValueState('None');
                      sap.ui.getCore().byId(SelectedLine).setValue(MaterialData[0].Data01);
                      sap.ui.getCore().byId(FillDescrption).setText(MaterialData[0].Data02);
                      sap.ui.getCore().byId(FillUOM).setValue(MaterialData[0].Data04);
                      sap.ui.getCore().byId(FillUOM).setEnabled(true);
                      sap.ui.getCore().byId(SelectedLine).setEnabled(false);

                    }
                    that.hideBusyIndicator();
                  } else {
                    that.hideBusyIndicator();
                    sap.ui.getCore().byId(SelectedLine).setValueState('Error');
                    sap.ui.getCore().byId(SelectedLine).setValue("");
                    // Raise Message
                    var message = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("MatChk");
                    sap.ui.getCore().byId(SelectedLine).setValueStateText(message);
                  }
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                  // alert(e.message);
                }
              },
            }
          );
        },
        onMaterailHelpRequest: function (oEvent) {
          var that = this;
          var LineArray = oEvent.getSource().getParent().getCells();
          var TableDetail = oEvent.getSource().getParent().sId;
          var SelWerks = sap.ui.getCore().byId("idSelectPostPlant").getValue();
          var SelLgort = "GI01";


          var Path = that.getView().getId();

          if (!that.MaterialHelpDialog) {
            that.MaterialHelpDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.MaterialHelpDialog",
              that
            );
            that.getView().addDependent(that.MaterialHelpDialog);
          }
          that.showBusyIndicator();
          TableMatGlobalId = TableDetail;

          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read(
            "/ValueHelpSet?$filter=Key01 eq 'Material' and Key02 eq '" +
            SelWerks +
            "' and Key03 eq '" +
            SelLgort +
            "'",
            {
              context: null,
              async: false,
              urlParameters: null,
              success: function (oData, oResponse) {
                try {
                  if (oData.results.length != 0) {
                    var MaterialData = oData.results;
                    if (MaterialData.length != 0) {
                      var MaterialModel = new sap.ui.model.json.JSONModel();

                      MaterialModel.setData({
                        MaterialData: MaterialData,
                      });
                      var MaterialList = sap.ui
                        .getCore()
                        .byId("idMaterialDialog");

                      MaterialList.setModel(MaterialModel, "MaterialModel");
                    }
                    that.hideBusyIndicator();
                    that.MaterialHelpDialog.open();
                  } else {
                    that.hideBusyIndicator();
                    // Raise Message
                    var message = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("BOM002");
                    MessageToast.show(message);
                    $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                  }
                } catch (e) {
                  MessageToast.show(e.message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                  // alert(e.message);
                }
              },
            }
          );
        },

        onMovementHelpRequest: function (oEvent) {
          var that = this;
          var sId = oEvent.getParameter("id");
          var TableDetail = oEvent.getSource().getParent().sId;
          var LineArray = oEvent.getSource().getParent().getCells();
          TableMvtGlobalId = TableDetail;
          var SelWerks = sap.ui.getCore().byId("idSelectPostPlant").getValue();
          var SelLgort = "GI01";
          if (LineArray.length != 0) {
            // SelWerks = LineArray[2].getProperty("text");
            // SelLgort = LineArray[3].getProperty("text");
          }

          var Path = that.getView().getId();

          if (!that.MovementHelpDialog) {
            that.MovementHelpDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.MovementHelpDialog",
              that
            );
            that.getView().addDependent(that.MovementHelpDialog);
          }
          that.showBusyIndicator();
          sMovementId = sId;

          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read("/ValueHelpSet?$filter=Key01 eq 'MovementType'", {
            context: null,
            async: false,
            urlParameters: null,
            success: function (oData, oResponse) {
              try {
                if (oData.results.length != 0) {
                  var MovementData = oData.results;
                  if (MovementData.length != 0) {
                    var MovementModel = new sap.ui.model.json.JSONModel();

                    MovementModel.setData({
                      MovementData: MovementData,
                    });
                    var MovementList = sap.ui
                      .getCore()
                      .byId("idMovementDialog");

                    MovementList.setModel(MovementModel, "MovementModel");
                  }
                  that.hideBusyIndicator();
                  that.MovementHelpDialog.open();
                } else {
                  that.hideBusyIndicator();
                  // Raise Message
                  var message = that
                    .getView()
                    .getModel("i18n")
                    .getResourceBundle()
                    .getText("BOM002");
                  MessageToast.show(message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                }
              } catch (e) {
                MessageToast.show(e.message);
                $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                // alert(e.message);
              }
            },
          });
        },

        onSupplyAreaHelpRequest: function (oEvent) {
          var that = this;
          var sId = oEvent.getParameter("id");
          var TableDetail = oEvent.getSource().getParent().sId;
          var Path = that.getView().getId();

          if (!that.ProdSuppAreaDialog) {
            that.ProdSuppAreaDialog = sap.ui.xmlfragment(
              "sap.pp.wcare.wmd.workmanagerapp.Fragments.HelpProdSuppAreaDialog",
              that
            );
            that.getView().addDependent(that.ProdSuppAreaDialog);
          }
          that.showBusyIndicator();
          sPrdSupAreaId = sId;
          TableSAGlobalId = TableDetail;
          var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
          var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

          oModel.read("/ValueHelpSet?$filter=Key01 eq 'SupplyArea'", {
            context: null,
            async: false,
            urlParameters: null,
            success: function (oData, oResponse) {
              try {
                if (oData.results.length != 0) {
                  var ProdSuppAreaData = oData.results;
                  if (ProdSuppAreaData.length != 0) {
                    var ProdSuppAreaModel = new sap.ui.model.json.JSONModel();

                    ProdSuppAreaModel.setData({
                      ProdSuppAreaData: ProdSuppAreaData,
                    });
                    var ProdSuppAreaList = sap.ui
                      .getCore()
                      .byId("idProdSuppAreaDialog");

                    ProdSuppAreaList.setModel(
                      ProdSuppAreaModel,
                      "ProdSuppAreaModel"
                    );
                  }
                  that.hideBusyIndicator();
                  that.ProdSuppAreaDialog.open();
                } else {
                  that.hideBusyIndicator();
                  // Raise Message
                  var message = that
                    .getView()
                    .getModel("i18n")
                    .getResourceBundle()
                    .getText("BOM002");
                  MessageToast.show(message);
                  $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                }
              } catch (e) {
                MessageToast.show(e.message);
                $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                // alert(e.message);
              }
            },
          });
        },
        onMaterialDataDialogSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter({
            filters: [
              new Filter("Data01", FilterOperator.Contains, sValue),
              new Filter("Data02", FilterOperator.Contains, sValue),
              new Filter("Data03", FilterOperator.Contains, sValue),
              new Filter("Data04", FilterOperator.Contains, sValue),
            ],
          });
          var oBinding = oEvent.getParameter("itemsBinding");
          oBinding.filter([oFilter]);
        },
        onUOMDataDialogSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter({
            filters: [
              new Filter("Data01", FilterOperator.Contains, sValue),
              new Filter("Data02", FilterOperator.Contains, sValue),
            ],
          });
          var oBinding = oEvent.getParameter("itemsBinding");
          oBinding.filter([oFilter]);
        },
        onMovementDataDialogSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter({
            filters: [
              new Filter("Data01", FilterOperator.Contains, sValue),
              new Filter("Data02", FilterOperator.Contains, sValue),
            ],
          });
          var oBinding = oEvent.getParameter("itemsBinding");
          oBinding.filter([oFilter]);
        },
        onMaterialHelpInputChange: function (oEvent) {
          var that = this;
          var Path = that.getView().getId();
          if (oEvent.getParameters().selectedItems != undefined) {
            var Material = oEvent
              .getParameters()
              .selectedItem.getCells()[0]
              .getTitle();

            sap.ui
              .getCore()
              .byId(`${Path}--idInputComponentSelNo`)
              .setValue(Material);

            that.onButtonPress();
          }
        },
        onUOMInputChange: function (oEvent) {
          var that = this;
          if (oEvent.getParameters().selectedItems != undefined) {
            var UOM = oEvent
              .getParameters()
              .selectedItem.getCells()[0]
              .getTitle();

            // TableUOMGlobalId
            var Array = TableUOMGlobalId.split("-");
            if (Array.length != 0) {
              var TableUpdateId = Array[0];
            }
            if (TableUpdateId === "idPostComponentList101") {
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList101")
                .getModel("ComponentModel101")
                .getData().ComponentData101;

              for (var ind = 0; ind < ComponentTable.length; ind++) {
                if (ComponentTable[ind].Data07 === " ") {
                  ComponentTable[ind].Data07 = UOM;
                  ComponentTable[ind].Data15 = true;
                }
              }
              sap.ui
                .getCore()
                .byId("idPostComponentList101")
                .getModel("ComponentModel101")
                .setData({ ComponentData101: ComponentTable });
            }
            if (TableUpdateId === "idPostComponentList261") {
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList261")
                .getModel("ComponentModel261")
                .getData().ComponentData261;

              for (var ind = 0; ind < ComponentTable.length; ind++) {
                if (ComponentTable[ind].Data07 === " ") {
                  ComponentTable[ind].Data07 = UOM;
                  ComponentTable[ind].Data15 = true;
                }
              }
              sap.ui
                .getCore()
                .byId("idPostComponentList261")
                .getModel("ComponentModel261")
                .setData({ ComponentData261: ComponentTable });
            }
            if (TableUpdateId === "idPostComponentList561") {
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList561")
                .getModel("ComponentModel561")
                .getData().ComponentData561;

              for (var ind = 0; ind < ComponentTable.length; ind++) {
                if (ComponentTable[ind].Data07 === " ") {
                  ComponentTable[ind].Data07 = UOM;
                  ComponentTable[ind].Data15 = true;
                }
              }
              sap.ui
                .getCore()
                .byId("idPostComponentList561")
                .getModel("ComponentModel561")
                .setData({ ComponentData561: ComponentTable });
            }

          }
        },
        onMaterialInputChange: function (oEvent) {
          var that = this;
          if (oEvent.getParameters().selectedItems != undefined) {
            var Material = oEvent
              .getParameters()
              .selectedItem.getCells()[0]
              .getTitle();
            var MatDesc = oEvent
              .getParameters()
              .selectedItem.getCells()[1]
              .getTitle();
            var MatUOM = oEvent
              .getParameters()
              .selectedItem.getCells()[3]
              .getTitle();
            // TableMatGlobalId
            var Array = TableMatGlobalId.split("-");
            if (Array.length != 0) {
              var TableUpdateId = Array[0];
            }
            if (TableUpdateId === "idPostComponentList101") {
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList101")
                .getModel("ComponentModel101")
                .getData().ComponentData101;

              for (var ind = 0; ind < ComponentTable.length; ind++) {
                if (ComponentTable[ind].Data01 === " ") {
                  ComponentTable[ind].Data01 = Material;
                  ComponentTable[ind].Data02 = MatDesc;
                  ComponentTable[ind].Data07 = MatUOM;
                  ComponentTable[ind].Data10 = false;
                }
              }
              sap.ui
                .getCore()
                .byId("idPostComponentList101")
                .getModel("ComponentModel101")
                .setData({ ComponentData101: ComponentTable });
            }
            if (TableUpdateId === "idPostComponentList261") {
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList261")
                .getModel("ComponentModel261")
                .getData().ComponentData261;

              for (var ind = 0; ind < ComponentTable.length; ind++) {
                if (ComponentTable[ind].Data01 === " ") {
                  ComponentTable[ind].Data01 = Material;
                  ComponentTable[ind].Data02 = MatDesc;
                  ComponentTable[ind].Data07 = MatUOM;
                  ComponentTable[ind].Data10 = false;
                }
              }
              sap.ui
                .getCore()
                .byId("idPostComponentList261")
                .getModel("ComponentModel261")
                .setData({ ComponentData261: ComponentTable });
            }
            if (TableUpdateId === "idPostComponentList561") {
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList561")
                .getModel("ComponentModel561")
                .getData().ComponentData561;

              for (var ind = 0; ind < ComponentTable.length; ind++) {
                if (ComponentTable[ind].Data01 === " ") {
                  ComponentTable[ind].Data01 = Material;
                  ComponentTable[ind].Data02 = MatDesc;
                  ComponentTable[ind].Data07 = MatUOM;
                  ComponentTable[ind].Data10 = false;
                }
              }
              sap.ui
                .getCore()
                .byId("idPostComponentList561")
                .getModel("ComponentModel561")
                .setData({ ComponentData561: ComponentTable });
            }

          }
        },
        onProdSuppAreaInputChange: function (oEvent) {
          var that = this;
          if (oEvent.getParameters().selectedItems != undefined) {

            var Array = TableSAGlobalId.split('-');
            if (Array.length != 0) {
              var SelTablId = Array[0];
            } else {
              return;
            }
            var ProdSupplyArea = oEvent
              .getParameters()
              .selectedItem.getCells()[0]
              .getTitle();
            if (SelTablId === 'idPostComponentList101') {
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList101")
                .getModel("ComponentModel101")
                .getData().ComponentData101;
              var HelpPrdSupAreaPath = sap.ui
                .getCore()
                .byId(sPrdSupAreaId)
                .getParent().oBindingContexts.ComponentModel101.sPath;
            }
            if (SelTablId === 'idPostComponentList261') {
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList261")
                .getModel("ComponentModel261")
                .getData().ComponentData261;
              var HelpPrdSupAreaPath = sap.ui
                .getCore()
                .byId(sPrdSupAreaId)
                .getParent().oBindingContexts.ComponentModel261.sPath;
            }
            if (SelTablId === 'idPostComponentList561') {
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList561")
                .getModel("ComponentModel561")
                .getData().ComponentData561;
              var HelpPrdSupAreaPath = sap.ui
                .getCore()
                .byId(sPrdSupAreaId)
                .getParent().oBindingContexts.ComponentModel561.sPath;
            }
            var Fid = "";
            Fid = sap.ui.getCore().byId(TableSAGlobalId).getCells()[2].sId;
            if (Fid != "") {
              if (Fid != undefined) {
                sap.ui.getCore().byId(Fid).setValueState('None');
                sap.ui.getCore().byId(Fid).setValueStateText('');
              }
            }

            var HelpPrdSupAreaArray = HelpPrdSupAreaPath.split("/");
            var HelpPrdSupAreaUpdate = parseInt(HelpPrdSupAreaArray[2]);

            for (var ind = 0; ind < ComponentTable.length; ind++) {
              if (HelpPrdSupAreaUpdate === ind) {
                ComponentTable[ind].Data11 = ProdSupplyArea;
              }
            }
            if (SelTablId === 'idPostComponentList101') {
              sap.ui
                .getCore()
                .byId("idPostComponentList101")
                .getModel("ComponentModel101")
                .setData({ ComponentData101: ComponentTable });
            }
            if (SelTablId === 'idPostComponentList261') {
              sap.ui
                .getCore()
                .byId("idPostComponentList261")
                .getModel("ComponentModel261")
                .setData({ ComponentData261: ComponentTable });
            }
            if (SelTablId === 'idPostComponentList561') {
              sap.ui
                .getCore()
                .byId("idPostComponentList561")
                .getModel("ComponentModel561")
                .setData({ ComponentData561: ComponentTable });
            }
          }
        },
        onMovementInputChange: function (oEvent) {
          var that = this;
          if (oEvent.getParameters().selectedItems != undefined) {

            var SelTable = TableMvtGlobalId.split('-');
            if (SelTable.length != 0) {
              var SelTableLine = SelTable[0];
            }

            var Movement = oEvent
              .getParameters()
              .selectedItem.getCells()[0]
              .getTitle();

            if (SelTableLine === 'idPostComponentList101') {
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList101")
                .getModel("ComponentModel101")
                .getData().ComponentData101;

              var HelpMovementPath = sap.ui
                .getCore()
                .byId(sMovementId)
                .getParent().oBindingContexts.ComponentModel101.sPath;
            }
            if (SelTableLine === 'idPostComponentList261') {
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList261")
                .getModel("ComponentModel261")
                .getData().ComponentData261;

              var HelpMovementPath = sap.ui
                .getCore()
                .byId(sMovementId)
                .getParent().oBindingContexts.ComponentModel261.sPath;
            }
            if (SelTableLine === 'idPostComponentList561') {
              var ComponentTable = sap.ui
                .getCore()
                .byId("idPostComponentList561")
                .getModel("ComponentModel561")
                .getData().ComponentData561;

              var HelpMovementPath = sap.ui
                .getCore()
                .byId(sMovementId)
                .getParent().oBindingContexts.ComponentModel561.sPath;
            }

            var MovementLineArray = HelpMovementPath.split("/");
            var MovementLineUpdate = parseInt(MovementLineArray[2]);

            for (var ind = 0; ind < ComponentTable.length; ind++) {
              if (MovementLineUpdate === ind) {
                ComponentTable[ind].Data08 = Movement;
              }
            }
            if (SelTableLine === 'idPostComponentList101') {
              sap.ui
                .getCore()
                .byId("idPostComponentList101")
                .getModel("ComponentModel101")
                .setData({ ComponentData101: ComponentTable });
            }
            if (SelTableLine === 'idPostComponentList261') {
              sap.ui
                .getCore()
                .byId("idPostComponentList261")
                .getModel("ComponentModel261")
                .setData({ ComponentData261: ComponentTable });
            }
            if (SelTableLine === 'idPostComponentList561') {
              sap.ui
                .getCore()
                .byId("idPostComponentList561")
                .getModel("ComponentModel561")
                .setData({ ComponentData561: ComponentTable });
            }
          }
        },

        onScarpPostCopy: function () {
          var that = this;

          var Tableindex = "X";
          var ScarpLine = {};

          Tableindex = sap.ui
            .getCore()
            .byId(`idPostScarpList`)
            .getSelectedIndices()[0];

          if (Tableindex != undefined) {

            var ScarpData = sap.ui
              .getCore()
              .byId("idPostScarpList")
              .getModel("PostScarpModel")
              .getData().PostScarpData;

            for (var ind = 0; ind < ScarpData.length; ind++) {
              if (Tableindex === ind) {
                // ComponentLine = ComponentTable[ind];
                var ScarpLine = {
                  Data01: ScarpData[ind].Data01,
                  Data02: ScarpData[ind].Data02,
                  Data03: ScarpData[ind].Data03,
                  Data04: ScarpData[ind].Data04,
                  Data05: ScarpData[ind].Data05,
                  Data06: ScarpData[ind].Data06,
                  Data07: ScarpData[ind].Data07,
                  Data08: ScarpData[ind].Data08,
                  Data09: ScarpData[ind].Data09,
                  Data10: ScarpData[ind].Data10,
                  Data11: ScarpData[ind].Data11,
                  Data12: ScarpData[ind].Data12,
                  Data13: ScarpData[ind].Data13,
                  Data14: ScarpData[ind].Data14,
                  Data15: ScarpData[ind].Data15,
                  Data16: ScarpData[ind].Data16,
                  Data17: ScarpData[ind].Data17,
                  Data18: ScarpData[ind].Data18,
                  Data19: ScarpData[ind].Data19,
                  Data20: ScarpData[ind].Data20,
                  Key01: ScarpData[ind].Key01,
                  Key02: ScarpData[ind].Key02,
                  Key03: ScarpData[ind].Key03,
                  Key04: ScarpData[ind].Key04,
                  Key05: ScarpData[ind].Key05,
                };
                ScarpData.push(ScarpLine);
              }
            }
            sap.ui
              .getCore()
              .byId("idPostScarpList")
              .getModel("PostScarpModel")
              .setData({ PostScarpData: ScarpData });
          }
        },

        onScarpCompCopy: function () {
          var that = this;

          var Tableindex = "X";
          var ScarpLine = {};

          Tableindex = sap.ui
            .getCore()
            .byId(`idScarpList`)
            .getSelectedIndices()[0];

          if (Tableindex != undefined) {

            var ScarpData = sap.ui
              .getCore()
              .byId("idScarpList")
              .getModel("ScarpModel")
              .getData().ScarpData;

            for (var ind = 0; ind < ScarpData.length; ind++) {
              if (Tableindex === ind) {
                // ComponentLine = ComponentTable[ind];
                var ScarpLine = {
                  Data01: ScarpData[ind].Data01,
                  Data02: ScarpData[ind].Data02,
                  Data03: ScarpData[ind].Data03,
                  Data04: ScarpData[ind].Data04,
                  Data05: ScarpData[ind].Data05,
                  Data06: ScarpData[ind].Data06,
                  Data07: ScarpData[ind].Data07,
                  Data08: ScarpData[ind].Data08,
                  Data09: ScarpData[ind].Data09,
                  Data10: ScarpData[ind].Data10,
                  Data11: ScarpData[ind].Data11,
                  Data12: ScarpData[ind].Data12,
                  Data13: ScarpData[ind].Data13,
                  Data14: ScarpData[ind].Data14,
                  Data15: ScarpData[ind].Data15,
                  Data16: ScarpData[ind].Data16,
                  Data17: ScarpData[ind].Data17,
                  Data18: ScarpData[ind].Data18,
                  Data19: ScarpData[ind].Data19,
                  Data20: ScarpData[ind].Data20,
                  Key01: ScarpData[ind].Key01,
                  Key02: ScarpData[ind].Key02,
                  Key03: ScarpData[ind].Key03,
                  Key04: ScarpData[ind].Key04,
                  Key05: ScarpData[ind].Key05,
                };
                ScarpData.push(ScarpLine);
              }
            }
            sap.ui
              .getCore()
              .byId("idScarpList")
              .getModel("ScarpModel")
              .setData({ ScarpData: ScarpData });
          }
        },
        onPostCompCopy101: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var ComponentLine = {};
          var Plant = " ";

          Tableindex = sap.ui
            .getCore()
            .byId(`idPostComponentList101`)
            .getSelectedIndices()[0];

          if (Tableindex != undefined) {
            // sap.ui.getCore().byId(`idPostComponentList`).clearSelection();

            var ComponentTable = sap.ui
              .getCore()
              .byId("idPostComponentList101")
              .getModel("ComponentModel101")
              .getData().ComponentData101;

            for (var ind = 0; ind < ComponentTable.length; ind++) {
              if (Tableindex === ind) {
                // ComponentLine = ComponentTable[ind];
                var ComponentLine = {
                  Data01: ComponentTable[ind].Data01,
                  Data02: ComponentTable[ind].Data02,
                  Data03: ComponentTable[ind].Data03,
                  Data04: ComponentTable[ind].Data04,
                  Data05: ComponentTable[ind].Data05,
                  Data06: ComponentTable[ind].Data06,
                  Data07: ComponentTable[ind].Data07,
                  Data08: ComponentTable[ind].Data08,
                  Data09: ComponentTable[ind].Data09,
                  Data10: ComponentTable[ind].Data10,
                  Data11: ComponentTable[ind].Data11,
                  Data12: ComponentTable[ind].Data12,
                  Data13: ComponentTable[ind].Data13,
                  Data14: ComponentTable[ind].Data14,
                  Data15: ComponentTable[ind].Data15,
                  Data16: ComponentTable[ind].Data16,
                  Data17: ComponentTable[ind].Data17,
                  Data18: ComponentTable[ind].Data18,
                  Data19: ComponentTable[ind].Data19,
                  Data20: ComponentTable[ind].Data20,
                  Key01: ComponentTable[ind].Key01,
                  Key02: ComponentTable[ind].Key02,
                  Key03: ComponentTable[ind].Key03,
                  Key04: ComponentTable[ind].Key04,
                  Key05: ComponentTable[ind].Key05,
                };
                ComponentTable.push(ComponentLine);
              }
            }
            sap.ui
              .getCore()
              .byId("idPostComponentList101")
              .getModel("ComponentModel101")
              .setData({ ComponentData101: ComponentTable });

            // ComponentData
          }
        },
        onPostCompCopy261: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var ComponentLine = {};
          var Plant = " ";

          Tableindex = sap.ui
            .getCore()
            .byId(`idPostComponentList261`)
            .getSelectedIndices()[0];

          if (Tableindex != undefined) {
            // sap.ui.getCore().byId(`idPostComponentList`).clearSelection();

            var ComponentTable = sap.ui
              .getCore()
              .byId("idPostComponentList261")
              .getModel("ComponentModel261")
              .getData().ComponentData261;

            for (var ind = 0; ind < ComponentTable.length; ind++) {
              if (Tableindex === ind) {
                // ComponentLine = ComponentTable[ind];
                var ComponentLine = {
                  Data01: ComponentTable[ind].Data01,
                  Data02: ComponentTable[ind].Data02,
                  Data03: ComponentTable[ind].Data03,
                  Data04: ComponentTable[ind].Data04,
                  Data05: ComponentTable[ind].Data05,
                  Data06: ComponentTable[ind].Data06,
                  Data07: ComponentTable[ind].Data07,
                  Data08: ComponentTable[ind].Data08,
                  Data09: ComponentTable[ind].Data09,
                  Data10: ComponentTable[ind].Data10,
                  Data11: ComponentTable[ind].Data11,
                  Data12: ComponentTable[ind].Data12,
                  Data13: ComponentTable[ind].Data13,
                  Data14: ComponentTable[ind].Data14,
                  Data15: ComponentTable[ind].Data15,
                  Data16: ComponentTable[ind].Data16,
                  Data17: ComponentTable[ind].Data17,
                  Data18: ComponentTable[ind].Data18,
                  Data19: ComponentTable[ind].Data19,
                  Data20: ComponentTable[ind].Data20,
                  Key01: ComponentTable[ind].Key01,
                  Key02: ComponentTable[ind].Key02,
                  Key03: ComponentTable[ind].Key03,
                  Key04: ComponentTable[ind].Key04,
                  Key05: ComponentTable[ind].Key05,
                };
                ComponentTable.push(ComponentLine);
              }
            }
            sap.ui
              .getCore()
              .byId("idPostComponentList261")
              .getModel("ComponentModel261")
              .setData({ ComponentData261: ComponentTable });

            // ComponentData
          }
        },
        onPostCompCopy561: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var ComponentLine = {};
          var Plant = " ";

          Tableindex = sap.ui
            .getCore()
            .byId(`idPostComponentList561`)
            .getSelectedIndices()[0];

          if (Tableindex != undefined) {
            // sap.ui.getCore().byId(`idPostComponentList`).clearSelection();

            var ComponentTable = sap.ui
              .getCore()
              .byId("idPostComponentList561")
              .getModel("ComponentModel561")
              .getData().ComponentData561;

            for (var ind = 0; ind < ComponentTable.length; ind++) {
              if (Tableindex === ind) {
                // ComponentLine = ComponentTable[ind];
                var ComponentLine = {
                  Data01: ComponentTable[ind].Data01,
                  Data02: ComponentTable[ind].Data02,
                  Data03: ComponentTable[ind].Data03,
                  Data04: ComponentTable[ind].Data04,
                  Data05: ComponentTable[ind].Data05,
                  Data06: ComponentTable[ind].Data06,
                  Data07: ComponentTable[ind].Data07,
                  Data08: ComponentTable[ind].Data08,
                  Data09: ComponentTable[ind].Data09,
                  Data10: ComponentTable[ind].Data10,
                  Data11: ComponentTable[ind].Data11,
                  Data12: ComponentTable[ind].Data12,
                  Data13: ComponentTable[ind].Data13,
                  Data14: ComponentTable[ind].Data14,
                  Data15: ComponentTable[ind].Data15,
                  Data16: ComponentTable[ind].Data16,
                  Data17: ComponentTable[ind].Data17,
                  Data18: ComponentTable[ind].Data18,
                  Data19: ComponentTable[ind].Data19,
                  Data20: ComponentTable[ind].Data20,
                  Key01: ComponentTable[ind].Key01,
                  Key02: ComponentTable[ind].Key02,
                  Key03: ComponentTable[ind].Key03,
                  Key04: ComponentTable[ind].Key04,
                  Key05: ComponentTable[ind].Key05,
                };
                ComponentTable.push(ComponentLine);
              }
            }
            sap.ui
              .getCore()
              .byId("idPostComponentList561")
              .getModel("ComponentModel561")
              .setData({ ComponentData561: ComponentTable });

            // ComponentData
          }
        },
        onScarpPostDel: function () {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var ScarpLine = {};
          var ScarpTableData = [];

          Tableindex = sap.ui
            .getCore()
            .byId(`idPostScarpList`)
            .getSelectedIndices()[0];

          if (Tableindex != undefined) {

            var ScarpData = sap.ui
              .getCore()
              .byId("idPostScarpList")
              .getModel("PostScarpModel")
              .getData().PostScarpData;

            for (var ind = 0; ind < ScarpData.length; ind++) {
              if (Tableindex != ind) {
                ScarpTableData.push(ScarpData[ind]);
              }
            }
            sap.ui
              .getCore()
              .byId("idPostScarpList")
              .getModel("PostScarpModel")
              .setData({ PostScarpData: ScarpTableData });

          }
        },

        onScarpCompDel: function () {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var ScarpLine = {};
          var ScarpTableData = [];

          Tableindex = sap.ui
            .getCore()
            .byId(`idScarpList`)
            .getSelectedIndices()[0];

          if (Tableindex != undefined) {

            var ScarpData = sap.ui
              .getCore()
              .byId("idScarpList")
              .getModel("ScarpModel")
              .getData().ScarpData;

            for (var ind = 0; ind < ScarpData.length; ind++) {
              if (Tableindex != ind) {
                ScarpTableData.push(ScarpData[ind]);
              }
            }
            sap.ui
              .getCore()
              .byId("idScarpList")
              .getModel("ScarpModel")
              .setData({ ScarpData: ScarpTableData });

          }
        },
        onPostCompDel101: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var ComponentLine = {};
          var ComponentNewData = [];

          Tableindex = sap.ui
            .getCore()
            .byId(`idPostComponentList101`)
            .getSelectedIndices()[0];

          if (Tableindex != undefined) {
            // sap.ui.getCore().byId(`idPostComponentList`).clearSelection();

            var ComponentTable = sap.ui
              .getCore()
              .byId("idPostComponentList101")
              .getModel("ComponentModel101")
              .getData().ComponentData101;

            for (var ind = 0; ind < ComponentTable.length; ind++) {
              if (Tableindex != ind) {
                // ComponentLine = ComponentTable[ind];
                var ComponentLine = {
                  Data01: ComponentTable[ind].Data01,
                  Data02: ComponentTable[ind].Data02,
                  Data03: ComponentTable[ind].Data03,
                  Data04: ComponentTable[ind].Data04,
                  Data05: ComponentTable[ind].Data05,
                  Data06: ComponentTable[ind].Data06,
                  Data07: ComponentTable[ind].Data07,
                  Data08: ComponentTable[ind].Data08,
                  Data09: ComponentTable[ind].Data09,
                  Data10: ComponentTable[ind].Data10,
                  Data11: ComponentTable[ind].Data11,
                  Data12: ComponentTable[ind].Data12,
                  Data13: ComponentTable[ind].Data13,
                  Data14: ComponentTable[ind].Data14,
                  Data15: ComponentTable[ind].Data15,
                  Data16: ComponentTable[ind].Data16,
                  Data17: ComponentTable[ind].Data17,
                  Data18: ComponentTable[ind].Data18,
                  Data19: ComponentTable[ind].Data19,
                  Data20: ComponentTable[ind].Data20,
                  Key01: ComponentTable[ind].Key01,
                  Key02: ComponentTable[ind].Key02,
                  Key03: ComponentTable[ind].Key03,
                  Key04: ComponentTable[ind].Key04,
                  Key05: ComponentTable[ind].Key05,
                };
                ComponentNewData.push(ComponentLine);
              }
            }
            sap.ui
              .getCore()
              .byId("idPostComponentList101")
              .getModel("ComponentModel101")
              .setData({ ComponentData101: ComponentNewData });

          }
        },
        onPostCompDel261: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var ComponentLine = {};
          var ComponentNewData = [];

          Tableindex = sap.ui
            .getCore()
            .byId(`idPostComponentList261`)
            .getSelectedIndices()[0];

          if (Tableindex != undefined) {
            // sap.ui.getCore().byId(`idPostComponentList`).clearSelection();

            var ComponentTable = sap.ui
              .getCore()
              .byId("idPostComponentList261")
              .getModel("ComponentModel261")
              .getData().ComponentData261;

            for (var ind = 0; ind < ComponentTable.length; ind++) {
              if (Tableindex != ind) {
                // ComponentLine = ComponentTable[ind];
                var ComponentLine = {
                  Data01: ComponentTable[ind].Data01,
                  Data02: ComponentTable[ind].Data02,
                  Data03: ComponentTable[ind].Data03,
                  Data04: ComponentTable[ind].Data04,
                  Data05: ComponentTable[ind].Data05,
                  Data06: ComponentTable[ind].Data06,
                  Data07: ComponentTable[ind].Data07,
                  Data08: ComponentTable[ind].Data08,
                  Data09: ComponentTable[ind].Data09,
                  Data10: ComponentTable[ind].Data10,
                  Data11: ComponentTable[ind].Data11,
                  Data12: ComponentTable[ind].Data12,
                  Data13: ComponentTable[ind].Data13,
                  Data14: ComponentTable[ind].Data14,
                  Data15: ComponentTable[ind].Data15,
                  Data16: ComponentTable[ind].Data16,
                  Data17: ComponentTable[ind].Data17,
                  Data18: ComponentTable[ind].Data18,
                  Data19: ComponentTable[ind].Data19,
                  Data20: ComponentTable[ind].Data20,
                  Key01: ComponentTable[ind].Key01,
                  Key02: ComponentTable[ind].Key02,
                  Key03: ComponentTable[ind].Key03,
                  Key04: ComponentTable[ind].Key04,
                  Key05: ComponentTable[ind].Key05,
                };
                ComponentNewData.push(ComponentLine);
              }
            }
            sap.ui
              .getCore()
              .byId("idPostComponentList261")
              .getModel("ComponentModel261")
              .setData({ ComponentData261: ComponentNewData });

          }
        },
        onPostCompDel561: function (oEvent) {
          var that = this;
          var index;
          var Path = that.getView().getId();

          var Tableindex = "X";
          var ComponentLine = {};
          var ComponentNewData = [];

          Tableindex = sap.ui
            .getCore()
            .byId(`idPostComponentList561`)
            .getSelectedIndices()[0];

          if (Tableindex != undefined) {
            // sap.ui.getCore().byId(`idPostComponentList`).clearSelection();

            var ComponentTable = sap.ui
              .getCore()
              .byId("idPostComponentList561")
              .getModel("ComponentModel561")
              .getData().ComponentData101;

            for (var ind = 0; ind < ComponentTable.length; ind++) {
              if (Tableindex != ind) {
                // ComponentLine = ComponentTable[ind];
                var ComponentLine = {
                  Data01: ComponentTable[ind].Data01,
                  Data02: ComponentTable[ind].Data02,
                  Data03: ComponentTable[ind].Data03,
                  Data04: ComponentTable[ind].Data04,
                  Data05: ComponentTable[ind].Data05,
                  Data06: ComponentTable[ind].Data06,
                  Data07: ComponentTable[ind].Data07,
                  Data08: ComponentTable[ind].Data08,
                  Data09: ComponentTable[ind].Data09,
                  Data10: ComponentTable[ind].Data10,
                  Data11: ComponentTable[ind].Data11,
                  Data12: ComponentTable[ind].Data12,
                  Data13: ComponentTable[ind].Data13,
                  Data14: ComponentTable[ind].Data14,
                  Data15: ComponentTable[ind].Data15,
                  Data16: ComponentTable[ind].Data16,
                  Data17: ComponentTable[ind].Data17,
                  Data18: ComponentTable[ind].Data18,
                  Data19: ComponentTable[ind].Data19,
                  Data20: ComponentTable[ind].Data20,
                  Key01: ComponentTable[ind].Key01,
                  Key02: ComponentTable[ind].Key02,
                  Key03: ComponentTable[ind].Key03,
                  Key04: ComponentTable[ind].Key04,
                  Key05: ComponentTable[ind].Key05,
                };
                ComponentNewData.push(ComponentLine);
              }
            }
            sap.ui
              .getCore()
              .byId("idPostComponentList561")
              .getModel("ComponentModel561")
              .setData({ ComponentData561: ComponentNewData });

          }
        },

      }
    );
  }
);
