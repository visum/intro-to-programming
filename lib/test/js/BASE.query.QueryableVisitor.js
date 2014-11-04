BASE.require([
  "BASE.unitTest.createInstance",
  "BASE.query.QueryableVisitor",
  "Array.prototype.asQueryable"
], function () {

	var createInstance = BASE.unitTest.createInstance;

	var MyTest = createInstance("BASE.query.QueryableVisitor: Description");
	MyTest.prepare = function (scope) {
		var queryable = [{
			firstName: "Jared",
			age: 32,
			lastName: "Barnes"
		}, {
			firstName: "Justin",
			age: 34,
			lastName: "Barnes"
		}, {
			firstName: "Jaelyn",
			age: 30,
			lastName: "Barnes"
		}, {
			firstName: "Jerika",
			age: 24,
			lastName: "Barnes"
		}].asQueryable();
		scope.queryable = queryable;
	};

	MyTest.test(function (expect, scope) {
		return new BASE.async.Future(function (setValue, setError) {
			var queryable = scope.queryable;
			var visitor = new BASE.query.QueryableVisitor(queryable);
			visitor.any = function () { };
			visitor.all = function () { };

			var expression = 

			var future = visitor.parse();

			future.then(function (value) {
				console.log(value);
			});
		});
	}).run();

});
