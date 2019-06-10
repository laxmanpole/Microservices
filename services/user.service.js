"use strict";
const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("moleculer-db");
const MongooseAdapter = require("moleculer-db-adapter-mongoose");
const user = require("../model/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
    name: "user",
    mixins: [DbService],
    adapter: new MongooseAdapter("mongodb://localhost:27017/microservices", { useNewUrlParser: true }),
    model: user,

    /**
     * Service settings
     */
    settings: {
        /** Secret for JWT */
        JWT_SECRET: process.env.JWT_SECRET || "jwt-conduit-secret",

        /** Public fields */
        fields: ["firstname", "lastname", "email", "password"],

        /** Validator schema for entity */
        entityValidator: {
            firstname: { type: "string" },
            lastname: { type: "string" },
            email: { type: "email" },
            password: { type: "string", min: 4 },
        }
    },

    /**
     * Service dependencies
     */
    dependencies: [],

    /**
     * Actions
     */
    actions: {

        register(ctx) {
            let entity = ctx.params;
            return this.validateEntity(entity)
                .then(() => {
                    if (entity.email)
                        return this.adapter.findOne({ email: entity.email })
                            .then(found => {
                                if (found)
                                    return Promise.reject(new MoleculerClientError("Email is exist!", 422, "", [{ field: "email", message: "is exist" }]));
                            });
                })
                .then(() => {
                    entity.password = bcrypt.hashSync(entity.password, 10);
                    entity.createdAt = new Date();

                    return this.adapter.insert(entity)
                        .then(doc => this.transformDocuments(ctx, {}, doc).then(() => doc));
                    //.then(user => this.transformEntity(user, true, ctx.meta.token))
                    //.then(json => this.entityChanged('created', json, ctx).then(() => json))
                });

        },


        login: {

            handler(ctx) {
                const { email, password } = ctx.params;
                console.log({ email, password });
                return this.Promise.resolve()
                    .then(() => this.adapter.findOne({ email }))
                    .then(user => {
                        if (!user)
                            return this.Promise.reject(new MoleculerClientError("Email or password is invalid!", 422, "", [{ field: "email", message: "is not found" }]));

                        return bcrypt.compare(password, user.password).then(res => {
                            if (!res)
                                return Promise.reject(new MoleculerClientError("Wrong password!", 422, "", [{ field: "email", message: "is not found" }]));

                            // Transform user entity (remove password and all protected fields)
                            console.log("Congrtaz...Login successfully");
                            return this.generateJWT(user);
                            //return this.transformDocuments(ctx, {}, user);

                        });
                    });

            }
        }
    },

    /**
     * Events
     */
    events: {

    },

    /**
     * Methods
     */
    methods: {

        generateJWT(user) {
            const today = new Date();
            const exp = new Date(today);
            exp.setDate(today.getDate() + 60);

            return jwt.sign({
                id: user._id,
                email: user.email,
                exp: Math.floor(exp.getTime() / 1000)
            }, this.settings.JWT_SECRET);

        },

        /**
         * Service created lifecycle event handler
         */
        // created() {

        // },

        /**
         * Service started lifecycle event handler
         */
        // started() {

        // },

        // /**
        //  * Service stopped lifecycle event handler
        //  */
        // stopped() {

        // }
    }
};