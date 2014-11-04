BASE.require([
    "BASE.query.Queryable",
    "BASE.query.Provider",
    "BASE.collections.Hashmap",
    "BASE.collections.MultiKeyMap",
    "BASE.util.Observable",
    "BASE.data.responses.ErrorResponse",
    "BASE.data.utils"
], function () {

    BASE.namespace("BASE.data.services");

    var global = (function () { return this; })();

    var Queryable = BASE.query.Queryable;
    var Provider = BASE.query.Provider;
    var Hashmap = BASE.collections.Hashmap;
    var MultiKeyMap = BASE.collections.MultiKeyMap;
    var Future = BASE.async.Future;
    var Observable = BASE.util.Observable;
    var ErrorResponse = BASE.data.responses.ErrorResponse;
    var flattenEntity = BASE.data.utils.flattenEntity;
    var Task = BASE.async.Task;

    BASE.data.services.SqliteService = function (sqliteDatabase) {
        var self = this;
        BASE.assertNotGlobal(self);

        Observable.call(self);

        var edm = sqliteDatabase.getEdm();
        var triggersByType = new Hashmap();
        var customActions = new MultiKeyMap();


        self.add = function (entity) {
            var timestamp = new Date();
            return new Future(function (setValue, setError) {
                return sqliteDatabase.add(entity).then(function (response) {
                    var edm = sqliteDatabase.getEdm();
                    var model = edm.getModelByType(entity.constructor);
                    var tableName = model.collectionName;
                    var primaryKeys = edm.getPrimaryKeyProperties(entity.constructor);

                    var event = {
                        type: "added",
                        entity: response.entity,
                        primaryKeys: primaryKeys,
                        tableName: tableName,
                        timestamp: timestamp
                    };

                    self.notify(event);

                    var task = new Task();
                    var actionsHash = customActions.get("add") || new Hashmap();

                    var actions = actionsHash.getValues().map(function (action) {
                        var future = action(event);
                        if (!(future instanceof Future)) {
                            throw new Error("All actions need to return a future.");
                        }
                        return future;
                    });

                    task.add.apply(task, actions).start().whenAll(function () {
                        setValue(response);
                    });

                }).ifError(function (responseError) {

                    self.notify({
                        type: "error",
                        entity: flattenEntity(entity, true),
                        error: responseError
                    });

                    setError(responseError);
                });
            });

        };

        self.update = function (entity, updates) {
            var timestamp = new Date();
            return new Future(function (setValue, setError) {
                sqliteDatabase.update(entity, updates).then(function (response) {
                    var edm = sqliteDatabase.getEdm();
                    var model = edm.getModelByType(entity.constructor);
                    var tableName = model.collectionName;
                    var primaryKeys = edm.getPrimaryKeyProperties(entity.constructor);

                    var event = {
                        type: "updated",
                        entity: flattenEntity(entity, true),
                        primaryKeys: primaryKeys,
                        tableName: tableName,
                        updates: updates,
                        timestamp: timestamp
                    };

                    self.notify(event);

                    var task = new Task();
                    var actionsHash = customActions.get("update") || new Hashmap();
                    var actions = actionsHash.getValues().map(function (action) {
                        var future = action(event);
                        if (!(future instanceof Future)) {
                            throw new Error("All actions need to return a future.");
                        }
                        return future;
                    });

                    task.add.apply(task, actions).start().whenAll(function () {
                        setValue(response);
                    });
                }).ifError(function (responseError) {
                    self.notify({
                        type: "error",
                        entity: flattenEntity(entity, true),
                        error: responseError
                    });
                    setError(resposneError);
                });
            });
        };

        self.remove = function (entity) {
            var timestamp = new Date();
            return new Future(function (setValue, setError) {
                // Clean house.
                var cleanTargets = function (relationship) {
                    var keyValue = entity[relationship.hasKey];

                    if (relationship.optional !== true) {
                        sqliteDatabase.asQueryable(relationship.ofType).where(function (e) {

                            return e.property(relationship.withForeignKey).isEqualTo(keyValue);

                        }).toArray(function (entities) {

                            entities.forEach(function (childEntity) {
                                if (childEntity) {
                                    self.remove(childEntity);
                                }
                            });

                        });

                    }
                };

                var cleanManyToManySources = function (relationship) {
                    var keyValue = entity[relationship.hasKey];

                    sqliteDatabase.asQueryable(relationship.usingMappingType).where(function (e) {

                        return e.property(relationship.withForeignKey).isEqualTo(keyValue);

                    }).toArray(function (entities) {

                        entities.forEach(function (childEntity) {
                            if (childEntity) {
                                self.remove(childEntity);
                            }
                        });

                    });

                };

                var cleanManyToManyTargets = function (relationship) {
                    var keyValue = entity[relationship.withKey];

                    sqliteDatabase.asQueryable(relationship.usingMappingType).where(function (e) {

                        return e.property(relationship.hasForeignKey).isEqualTo(keyValue);

                    }).toArray(function (entities) {

                        entities.forEach(function (childEntity) {
                            if (childEntity) {
                                self.remove(childEntity);
                            }
                        });

                    });

                };

                edm.getOneToOneRelationships(entity).forEach(cleanTargets);
                edm.getOneToManyRelationships(entity).forEach(cleanTargets);

                edm.getManyToManyRelationships(entity).forEach(cleanManyToManySources);
                edm.getManyToManyAsTargetRelationships(entity).forEach(cleanManyToManyTargets);

                sqliteDatabase.remove(entity).then(function (response) {
                    var edm = sqliteDatabase.getEdm();
                    var model = edm.getModelByType(entity.constructor);
                    var tableName = model.collectionName;
                    var primaryKeys = edm.getPrimaryKeyProperties(entity.constructor);

                    var event = {
                        type: "removed",
                        entity: flattenEntity(entity, true),
                        primaryKeys: primaryKeys,
                        tableName: tableName,
                        timestamp: timestamp
                    };

                    self.notify(event);

                    var task = new Task();
                    var actionsHash = customActions.get("remove") || new Hashmap();
                    var actions = actionsHash.getValues().map(function (action) {
                        var future = action(event);
                        if (!(future instanceof Future)) {
                            throw new Error("All actions need to return a future.");
                        }
                        return future;
                    });

                    task.add.apply(task, actions).start().whenAll(function () {
                        setValue(response);
                    });

                }).ifError(function (responseError) {
                    self.notify({
                        type: "error",
                        entity: flattenEntity(entity, true),
                        error: responseError
                    });

                    setError(responseError);
                });
            }).then();
        };

        self.getSourcesOneToOneTargetEntity = function (sourceEntity, relationship) {
            var targetType = relationship.ofType;
            var targetDataStore = sqliteDatabase.getDataStore(targetType);

            return new Future(function (setValue, setError) {
                sqliteDatabase.asQueryable(targetType).where(function (e) {
                    return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey]);
                }).firstOrDefault().then(setValue).ifError(setError);
            });
        };

        self.getTargetsOneToOneSourceEntity = function (targetEntity, relationship) {
            var sourceType = relationship.type;
            var sourceDataStore = sqliteDatabase.getDataStore(sourceType);

            return new Future(function (setValue, setError) {
                sqliteDatabase.asQueryable(sourceType).where(function (e) {
                    return e.property(relationship.hasKey).isEqualTo(targetEntity[relationship.withForeignKey]);
                }).firstOrDefault().then(setValue).ifError(setError);
            });
        };

        self.getSourcesOneToManyQueryProvider = function (sourceEntity, relationship) {
            var provider = new Provider();

            provider.execute = provider.toArray = function (queryable) {
                return new Future(function (setValue, setError) {
                    var targetsDataStore = sqliteDatabase.getDataStore(relationship.ofType);
                    var targetQueryable = targetsDataStore.asQueryable().where(function (e) {
                        return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey]);
                    });

                    targetQueryable.merge(queryable).toArray(setValue).ifError(setError);

                });
            };

            return provider;
        };

        self.getTargetsOneToManySourceEntity = function (targetEntity, relationship) {
            var sourceType = relationship.type;
            var sourceDataStore = sqliteDatabase.getDataStore(sourceType);

            return new Future(function (setValue, setError) {
                sqliteDatabase.asQueryable(sourceType).where(function (e) {
                    return e.property(relationship.hasKey).isEqualTo(targetEntity[relationship.withForeignKey]);
                }).firstOrDefault().then(setValue).ifError(setError);
            });
        };


        // TODO: optimize the many to many with joins.
        self.getSourcesManyToManyQueryProvider = function (sourceEntity, relationship) {
            var provider = new Provider();

            provider.execute = provider.toArray = function (queryable) {
                return new Future(function (setValue, setError) {

                    var mappingDataStore = sqliteDatabase.getDataStore(relationship.usingMappingType);
                    var targetDataStore = sqliteDatabase.getDataStore(relationship.ofType);

                    mappingDataStore.asQueryable().where(function (e) {
                        return e.property(relationship.withForeignKey).isEqualTo(sourceEntity[relationship.hasKey])
                    }).toArray(function (mappingEntities) {
                        targetDataStore.asQueryable().where(function (e) {
                            var ids = [];
                            mappingEntities.forEach(function (mappingEntity) {
                                ids.push(e.property(relationship.withKey).isEqualTo(mappingEntity[relationship.hasForeignKey]));
                            });

                            return e.or.apply(e, ids);
                        }).toArray(setValue);
                    });
                });
            };

            return provider;
        };

        self.getTargetsManyToManyQueryProvider = function (targetEntity, relationship) {
            var provider = new Provider();

            provider.execute = provider.toArray = function (queryable) {
                return new Future(function (setValue, setError) {
                    var mappingDataStore = sqliteDatabase.getDataStore(relationship.usingMappingType);
                    var sourceDataStore = sqliteDatabase.getDataStore(relationship.type);

                    mappingDataStore.asQueryable().where(function (e) {
                        return e.property(relationship.hasForeignKey).isEqualTo(targetEntity[relationship.withKey])
                    }).toArray(function (mappingEntities) {
                        sourceDataStore.asQueryable().where(function (e) {
                            var ids = [];
                            mappingEntities.forEach(function (mappingEntity) {
                                ids.push(e.property(relationship.hasKey).isEqualTo(mappingEntity[relationship.withForeignKey]));
                            });

                            return e.or.apply(e, ids);
                        }).toArray(setValue);
                    });
                });
            };

            return provider;
        };

        self.asQueryable = function (Type) {
            var queryable = new Queryable(Type);
            queryable.provider = self.getQueryProvider(Type);

            return queryable;
        };

        self.getQueryProvider = function (Type) {
            return sqliteDatabase.getQueryProvider(Type);
        };

        self.getEdm = function () {
            return sqliteDatabase.getEdm();
        };

        //These are functions only specific to this service. These aren't for the dataContext.
        self.registerAction = function (verb, actionCallback) {
            if (typeof verb === "undefined" || typeof actionCallback === "undefined") {
                throw new Error("A verb and an actionCallback are required.");
            }

            customActions.add(verb, actionCallback, actionCallback);

            var action = {
                dispose: function () {
                    customActions.remove(verb, actionCallback);
                }
            };

            return action
        };
    };

    var isSupported = (typeof global.sqlitePlugin === "undefined") && (typeof global.openDatabase === "undefined");
    BASE.data.services.SqliteService.isSupported = isSupported;


});