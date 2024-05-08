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
      "sap.pp.wcare.wmd.workmanagerapp.controller.Initial_01", {
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
        }, 10000);

        var PlantName = sap.ui
          .getCore()
          .byId(Path + "--idTextPlantName")
          .getText();

        var Path = that.getView().getId();
        var PROES = sap.ui.getCore().byId(Path + "--idPROESTitleExp").getText();
        sap.ui.getCore().byId(Path + "--idPROESTitleExp").setText(PROES + " - " + PlantName);
        var PROES = sap.ui.getCore().byId(Path + "--idPROESTitleSnap").getText();
        sap.ui.getCore().byId(Path + "--idPROESTitleSnap").setText(PROES + " - " + PlantName);

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
        IEntry.NavWC_Component = [{}];

        oDataModel.create(
          "/WorkCenter_AreaOrderSet",
          IEntry,
          null,
          function (oData, Response) {
            try {
              othis.hideBusyIndicator();
              var Path = othis.getView().getId();
              // In Progress
              var InProgressData = oData.NavWC_InProgress.results;
              if (InProgressData.length === 0) {
                // Do Nothing
              }
              var InProgressModel = new sap.ui.model.json.JSONModel();

              InProgressModel.setData({
                InProgressData: InProgressData,
              });
              var InProgressTable = sap.ui
                .getCore()
                .byId(Path + "--idInprogressOrderList");

              InProgressTable.setModel(InProgressModel, "InProgressModel");

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
              // }
            } catch (e) {
              // alert(e.message);
              // MessageBox.error(e.message);
              othis.hideBusyIndicator();
              MessageToast.show(e.message);
            }
          }
        );

        var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
        var oPlantModel = new sap.ui.model.odata.ODataModel(sUrl, true);

        oPlantModel.read("/ZshWerksSet", {
          context: null,
          urlParameters: null,
          success: function (oData, oResponse) {
            try {
              var Path = othis.getView().getId();
              var PlantData = oData.results;
              var PlantModel = new sap.ui.model.json.JSONModel();

              PlantModel.setData({
                PlantData: PlantData,
              });
              var PlantTable = sap.ui.getCore().byId(Path + "--idInputPlant");

              PlantTable.setModel(PlantModel, "PlantModel");
            } catch (e) {
              alert(e.message);
            }
          },
        });
      },
      /* BUSY INDICATOR*/
      showBusyIndicator: function () {
        sap.ui.core.BusyIndicator.show(100);
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

      onValueHelpRequested: function () { },
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
          "'", {
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
              // alert(e.message);
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
          "'", {
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
          sap.ui.getCore().byId(`${Path}--idInprogressOrderList`).clearSelection();
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
            sap.ui.getCore().byId(`${Path}--idQueueOrderList`).clearSelection();
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
          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idFutureOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            sap.ui.getCore().byId(`${Path}--idFutureOrderList`).clearSelection();
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
          "'", {
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
                BOMTable.setTitle(Popup + ' ' + SelMatnr + ' - ' + SelMaktx);
                sap.ui.getCore().byId("idBOMDialog-cancel").setText("Close");
              } else {
                // Raise Message
                var message = that
                  .getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("BOM002");
                MessageToast.show(message);
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
          sap.ui.getCore().byId(`${Path}--idInprogressOrderList`).clearSelection();
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
            sap.ui.getCore().byId(`${Path}--idQueueOrderList`).clearSelection();
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
          Tableindex = sap.ui
            .getCore()
            .byId(`${Path}--idFutureOrderList`)
            .getSelectedIndices()[0];
          // Get Order No & Opr No
          if (Tableindex != undefined) {
            sap.ui.getCore().byId(`${Path}--idFutureOrderList`).clearSelection();
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
          "'", {
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
                sap.ui.getCore().byId("idRoutingDialog-cancel").setText("Close");
              } else {
                // Raise Message
                var message = that
                  .getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("Route002");
                MessageToast.show(message);
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
            new Filter("Data08", FilterOperator.Contains, sValue)
          ]
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
            new Filter("Data08", FilterOperator.Contains, sValue)
          ]
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
            new Filter("Data01", FilterOperator.Contains, sValue)
          ]
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
              .byId(`${Path}--idInputWorkCenter`)
              .setValue("");

            sap.ui
              .getCore()
              .byId(`${Path}--idTextWorkArea`)
              .setText(Workcenter);

            sap.ui
              .getCore()
              .byId(`${Path}--idTextWorkCenter`)
              .setText("");

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
          sap.ui.getCore().byId(`${Path}--idInprogressOrderList`).clearSelection();
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
            sap.ui.getCore().byId(`${Path}--idQueueOrderList`).clearSelection();
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
            sap.ui.getCore().byId(`${Path}--idFutureOrderList`).clearSelection();
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
          "'", {
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
                var blob = new Blob([uint8Array], { type: 'application/pdf' });

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
        contentType = contentType || '';
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
          type: contentType
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
        } else {
          // Tableindex = sap.ui
          //   .getCore()
          //   .byId(`${Path}--idQueueOrderList`)
          //   .getSelectedIndices()[0];
          // // Get Order No & Opr No
          // if (Tableindex != undefined) {
          //   SelAufnr = sap.ui
          //     .getCore()
          //     .byId(`${Path}--idQueueOrderList`)
          //     .getModel("InQueueModel")
          //     .getData().InQueueData[Tableindex].Data02;
          //   SelOprNo = sap.ui
          //     .getCore()
          //     .byId(`${Path}--idQueueOrderList`)
          //     .getModel("InQueueModel")
          //     .getData().InQueueData[Tableindex].Data05;
          // }
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

        that.hideBusyIndicator();
      },

      OnOperatorfill: function () {
        var that = this;
        var sValue = sap.ui
          .getCore()
          .byId(`idStartOperator`)
          .getValue();
        // var sValue = oEvent.getParameter("value");
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
          "'", {
          context: null,
          async: false,
          urlParameters: null,
          success: function (oData, oResponse) {
            try {
              var sPath = that.getView().getId();
              if (oData.results.length != 0) {
                var emparray = oData.results[0];
                sap.ui
                  .getCore()
                  .byId(`idStartOperator`)
                  .setValue(sValue);
                sap.ui.getCore().byId(`idStartOperator`).setValueState("None");
              } else {
                sap.ui
                  .getCore()
                  .byId(`idStartOperator`)
                  .setValue();
                sap.ui.getCore().byId(`idStartOperator`).setValueState("Error");
                // Please contact admin to create you account
                // Get Message
                var Emessage = that
                .getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("Start001");
                sap.ui.getCore().byId(`idStartOperator`).setValueStateText(Emessage);
              }
            } catch (e) {
              MessageToast.show(e.message);
              // alert(e.message);
            }
          },
        }
        );
      },
      onConfirmStartPress: function (oEvent) {
        var that = this;
        var index;
        var Path = that.getView().getId();
        that.OnOperatorfill();
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
        var StartDate = sap.ui.getCore().byId("idStartDate").getValue();
        var StartTime = sap.ui.getCore().byId("idStartTime").getValue();
        var ScreenText = sap.ui.getCore().byId("idStartText").getText();
        var SelOrderNo = sap.ui.getCore().byId("idSelectOrder").getValue();
        var SelOrderOpr = sap.ui.getCore().byId("idSelectOprNo").getValue();

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
        that.StartDialog.close();

        oDataModel.create(
          "/WorkCenter_AreaOrderSet",
          IEntry,
          null,
          function (oData, Response) {
            try {
              that.hideBusyIndicator();
              that.onButtonPress();
              MessageToast.show("Update Successful");
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
          "'", {
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
        // var FirstName = sap.ui.getCore().byId("idStopFName").getValue();
        // var LastName = sap.ui.getCore().byId("idStopLName").getValue();
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
        IEntry.NavWC_Component = [{}];
        // that.StopDialog.close();

        oDataModel.create(
          "/WorkCenter_AreaOrderSet",
          IEntry,
          null,
          function (oData, Response) {
            try {
              that.hideBusyIndicator();
              that.onButtonPress();
              MessageToast.show("Update Successful");
              return;
            } catch (e) {
              alert(e.message);
              that.hideBusyIndicator();
            }
          }
        );
      },
      onCancelStopPress: function () {
        var that = this;
        that.StopDialog.close();
        // Raise Message
        var message = that
          .getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText("Gen001");
        MessageBox.confirm(message);
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
          sap.ui.getCore().byId(`${Path}--idInprogressOrderList`).clearSelection();
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
            sap.ui.getCore().byId(`${Path}--idQueueOrderList`).clearSelection();
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
            sap.ui.getCore().byId(`${Path}--idFutureOrderList`).clearSelection();
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
          "'", {
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
        }
        sap.ui.getCore().byId(`idScarpReason`).setValue("");
        sap.ui.getCore().byId(`idScarpQuantity`).setValue("");
        that.ScrapActionDialog.open();
      },
      onScarpReasonRequest: function () {
        var that = this;
        var Path = that.getView().getId();
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
        var sUrl = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
        var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);

        oModel.read(
          "/ValueHelpSet?$filter=Key01 eq 'ScrapReason' and Key02 eq '" +
          SelPlant +
          "'", {
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
      _onScarpReasonSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter("Data03", FilterOperator.Contains, sValue);
        var oBinding = oEvent.getParameter("itemsBinding");
        oBinding.filter([oFilter]);
      },
      _ScarpReasonSelect: function (oEvent) {
        if (oEvent.getParameters().selectedItems != undefined) {
          var ScarpReason = oEvent
            .getParameters()
            .selectedItems[0].getTitle();
          if (ScarpReason != undefined) {
            var Path = this.getView().getId();
            sap.ui.getCore().byId(`idScarpReason`).setValue(ScarpReason);

            oEvent.getSource().getBinding("items").filter([]);
          } else {
            return;
          }
          // this.onButtonPress();
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

        var UrlInit = "/sap/opu/odata/sap/ZPP_WORKMANAGER_APP_SRV/";
        var oDataModel = new sap.ui.model.odata.ODataModel(UrlInit);
        var Data01 = sap.ui.getCore().byId(`idScarpReason`).getValue();
        if (Data01 === "") {
          var message = that
            .getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("Scarp001");
          MessageBox.error(message);
          return;
        }
        var Data02 = sap.ui.getCore().byId(`idScarpQuantity`).getValue();
        if (Data02 === "") {
          var message = that
            .getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("Scarp002");
          MessageBox.error(message);
          return;
        }

        that.ScrapActionDialog.close();

        var itemset = {
          Key01: "Scarp",
          Key02: SelAufnr,
          Key03: SelOprNo,
          Key04: SelPlant,
          Key05: SelOprerator,
          Data01: Data01,
          Data02: Data02,
        };

        var IEntry = [];
        IEntry = itemset;
        oDataModel.create(
          "/ValueHelpSet",
          IEntry,
          null,
          function (oData, Response) {
            try {
              if (Response.data.Data01 === 'S') {
                that.hideBusyIndicator();
                var message = that
                  .getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("Gen003");
                MessageToast.show(message);
                return;
              }
              if (Response.data.Data01 === 'E') {
                that.hideBusyIndicator();
                MessageBox.error(Response.data.Data02);
                return;
              }
            } catch (e) {
              // alert(e.message);
              Message.error(e.message);
              that.hideBusyIndicator();
            }
          }
        );
      },
      onCancelScarpPress: function (oEvent) {
        var that = this;
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
        }
        if (EndDate === "") {
          var message = that
            .getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("Post002");
          MessageBox.error(message);
          return;
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
        if (!that.PostActionDialog) {
          that.PostActionDialog = sap.ui.xmlfragment(
            "sap.pp.wcare.wmd.workmanagerapp.Fragments.PostAction",
            that
          );
          that.getView().addDependent(that.PostActionDialog);
        }
        that.showBusyIndicator();
        sap.ui.getCore().byId(`idPostOperator`).setValue(OperatorNo);
        sap.ui.getCore().byId(`idSelectPostPlant`).setValue(SelPlant);
        sap.ui.getCore().byId(`idPostQuantity`).setValue();

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
          "'", {
          context: null,
          async: false,
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
          "'", {
          context: null,
          async: false,
          urlParameters: null,
          success: function (oData, oResponse) {
            try {
              if (oData.results.length != 0) {
                var ComponentData = oData.results;
                if (ComponentData.length != 0) {
                  var ComponentModel = new sap.ui.model.json.JSONModel();

                  ComponentModel.setData({
                    ComponentData: ComponentData,
                  });
                  var ComponentnList = sap.ui
                    .getCore()
                    .byId("idPostComponentList");

                  if (ComponentData[0].Key03 === 'N') {
                    var HeaderText = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("ComponentDetail");
                  }
                  if (ComponentData[0].Key03 === 'S') {
                    var HeaderText = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("GRDetail");
                  }

                  ComponentnList.setHeaderText(HeaderText);

                  ComponentnList.setModel(ComponentModel, "ComponentModel");
                }
                that.hideBusyIndicator();
              } else {
                var ComponentData = [];
                var ComponentModel = new sap.ui.model.json.JSONModel();

                ComponentModel.setData({
                  ComponentData: ComponentData,
                });
                var ComponentnList = sap.ui
                  .getCore()
                  .byId("idPostComponentList");


                ComponentnList.setHeaderText(""); // Blank

                ComponentnList.setModel(ComponentModel, "ComponentModel");
                that.hideBusyIndicator();
              }
            } catch (e) {
              MessageToast.show(e.message);
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
          "'", {
          context: null,
          async: false,
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
            }
          },
        }
        );
        that.PostActionDialog.open();
      },
      onConfirmPostPress: function () {
        var that = this;
        var index;
        var Path = that.getView().getId();

        var YeildQty = sap.ui.getCore().byId("idPostQuantity").getValue();

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
        IEntry.Key01 = "POST";
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

        // Get Component Details
        // IEntry.NavWC_Component = [{}];

        IEntry.NavWC_Component = sap.ui
          .getCore()
          .byId("idPostComponentList")
          .getModel("ComponentModel")
          .getData().ComponentData;
        that.PostActionDialog.close();
        // that.PostActionDialog.destroy();

        oDataModel.create(
          "/WorkCenter_AreaOrderSet",
          IEntry,
          null,
          function (oData, Response) {
            try {
              // console.log(oData);
              that.hideBusyIndicator();
              if (oData.Key04 === "E") {
                var message = oData.Key05;
                MessageBox.error(message);
                return;
              } else {
                var message = oData.Key05;
                MessageBox.success(message);
                that.onButtonPress();
              }
              return;
            } catch (e) {
              // alert(e.message);
              that.hideBusyIndicator();
              MessageToast.show(e.message);
            }
          }
        );
      },
      onCancelPostPress: function () {
        var that = this;
        that.PostActionDialog.close();
        // that.PostActionDialog.destroy();
      },
      onPostQuantityChange: function (oEvent) {
        var value = oEvent.getParameter("value");
        var valueArray = value.split(".");
        if (valueArray.length != 2) {
          value = value + ".000";
        }
        sap.ui.getCore().byId("idPostQuantity").setValue(value);
      },
      onTableRowSelectionChange: function (oEvent) {
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
                .setEnabled(true);
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
          sap.ui.getCore().byId(`${Path}--idINPStopJob`).setEnabled(true);
          sap.ui.getCore().byId(`${Path}--idINPStartJob`).setEnabled(true);
        }
      },

      onBatchHelpRequest: function (oEvent) {
        var that = this;
        var LineArray = oEvent.getSource().getParent().getCells();
        var SelMatnr = " ";
        var SelWerks = " ";
        var SelLgort = " ";
        var SelClabs = " ";
        if (LineArray.length != 0) {
          SelMatnr = LineArray[0].getTitle();
          SelWerks = LineArray[1].getTitle();
          SelLgort = LineArray[2].getTitle();
          SelClabs = LineArray[4].getValue();
        }

        var Path = that.getView().getId();

        if (!that.BatchHelpDialog) {
          that.BatchHelpDialog = sap.ui.xmlfragment(
            "sap.pp.wcare.wmd.workmanagerapp.Fragments.BatchHelpDialog",
            that
          );
          that.getView().addDependent(that.BatchHelpDialog);
        }
        that.showBusyIndicator();

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
          "'", {
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
              }
            } catch (e) {
              MessageToast.show(e.message);
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

          var ComponentTable = sap.ui
            .getCore()
            .byId("idPostComponentList")
            .getModel("ComponentModel")
            .getData().ComponentData;

          for (var ind = 0; ind < ComponentTable.length; ind++) {
            if (
              Component === ComponentTable[ind].Data01 &&
              Plant === ComponentTable[ind].Data03 &&
              Location === ComponentTable[ind].Data04
            ) {
              ComponentTable[ind].Data05 = Batch;
            }
          }
          sap.ui
            .getCore()
            .byId("idPostComponentList")
            .getModel("ComponentModel")
            .setData("ComponentTable", ComponentTable);
        }
      },
      onBatchInputClose: function () {
        this.BatchHelpDialog.close();
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
            .setValue();
          that.onLoadData(that, Plant, WorkcenterArea, Workcenter);
        }
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

        if (Plant != " ") {
          that.onLoadData(that, Plant, WorkcenterArea, Workcenter);
        }
      },
    }
    );
  }
);