var FirebaseModel = function () {
    var self = this;
    self.rows = ko.observableArray([]);
    self.type = ko.observable('');
    self.title = ko.observable('');
    self.init = function (token) {
        var reference = token.child('orders');
        reference.on('value', function (snapshot) {
            var vals = _.where(snapshot.val(), {'statu': self.type()})
            self.rows(vals);
        });
    };
    self.rows.subscribe(function () {
        firebaseDashboard.chart();
    });
};

var Dashboard = function () {
    var self = this;
    self.instances = ko.observableArray([]);
    self.token = ko.observable();

    self.register = function (type, title) {
        var instance = new FirebaseModel();
        instance.title(title);
        instance.type(type);
        instance.init(self.getToken());
        self.instances.push(instance);
    };

    self.getToken = function () {
        if (self.token()) {
            return self.token();
        } else {
            self.token(new Firebase('https://bahattintest.firebaseio.com/'));
            return self.token();
        }
    };

    self.chart = function () {
        var content = [];
        _.each(self.instances(), function (instance) {
            content.push([instance.title(), instance.rows().length])
        });

        $('#container').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: 'Orders'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [
                {
                    type: 'pie',
                    name: 'Orders',
                    data: content
                }
            ]
        });
    };
};