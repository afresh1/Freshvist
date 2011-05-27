describe("Checkvist", function() {
    var feedreader;

    beforeEach(function() {
        feedreader = new AFresh1.Checkvist();
    });

    it("kind should be an enyo.VFlexBox", function() {
        expect(feedreader.kind).toEqual(enyo.VFlexBox);
    });

    describe("PageHeader", function() {
        it("Should have the proper page header", function() {
            expect(feedreader.$.pageHeader.content).toEqual('Enyo Checkvist');
        });
    });


});
