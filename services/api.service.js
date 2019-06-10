"use strict";
const express = require("express");
const route = express.Router();
const ApiGateway = require("moleculer-web");

module.exports = {
    name: "api",
    mixins: [ApiGateway],

    // More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
    settings: {
        port: process.env.PORT || 3000,

        routes: [{
            path: "/api",


            use: [

                route.post("/api/user/register",
                    function(err, req, res) {
                        this.logger.error("Error is occured in middlewares!");
                        this.sendError(req, res, err);
                    }),
                route.post("/api/user/login",
                    function(err, req, res) {
                        this.logger.error("Error is occured in middlewares!");
                        this.sendError(req, res, err);
                    })
            ],
        }],

        // Serve assets from "public" folder
        // assets: {
        //     folder: "public"
        // }
    }
};