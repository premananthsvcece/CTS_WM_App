/*global QUnit*/

sap.ui.define([
	"sapppwcarewmd/workmanagerapp/controller/Initial_01.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Initial_01 Controller");

	QUnit.test("I should test the Initial_01 controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
