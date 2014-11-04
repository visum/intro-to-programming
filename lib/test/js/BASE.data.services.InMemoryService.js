BASE.require([
  "BASE.unitTest.createInstance",
  "BASE.data.services.InMemoryService"
], function () {

	var createInstance = BASE.unitTest.createInstance;
	var InMemoryService = BASE.data.services.InMemoryService;

	var Person = function () {
		this.id = null;
		this.firstName = null;
		this.lastName = null;
		this.age = 0;
		this.addresses = [];
		this.phoneNumbers = [];
		this.department = null;
	};

	var Department = function () {
		this.id = null;
		this.name = null;
	};

	var Address = function () {
		this.id = null;
		this.street1 = null;
		this.street2 = null;
		this.city = null;
		this.state = null;
		this.zip = null;
		this.country = null;
	};

	var PhoneNumber = function () {
		this.id = null;
		this.prefix = 0;
		this.suffix = 0;
		this.areacode = 0;
	};

	var relationships = {
		oneToOne: [{
			type: Person,
			hasKey: "id",
			hasOne: "department",
			ofType: Department,
			withKey: "id",
			withForeignKey: "personId",
			withOne: "person"
		}],
		oneToMany: [{
			type: Person,
			hasKey: "id",
			hasMany: "phoneNumbers",
			ofType: PhoneNumber,
			withKey: "id",
			withForeignKey: "personId",
			withOne: "person"
		}],
		manyToMany: [{
			type: Person,
			hasKey: "id",
			hasForeignKey: "addressId",
			hasMany: "addresses",
			ofType: Address,
			withKey: "id",
			withForeignKey: "personId",
			withMany: "people"
		}]
	};

	var asQueryableTest = createInstance("BASE.data.services.InMemoryService");
	asQueryableTest.prepare = function (scope) {
		scope.service = new InMemoryService(relationships);
	};

	asQueryableTest.test(function (expect, scope) {
		var queryable = scope.service.asQueryable(Person);

		queryable.where(function (e) {
			return e.property("phoneNumbers").any(function (e) {
				return e.property("areacode").isEqualTo(435);
			});
		}).toArray().then(function (a) {

		})
	}).run();

});
