function ExamineContentAppController($http, $q, $timeout, umbRequestHelper, localizationService, overlayService, editorService, editorState) {
    var vm = this;
    vm.searchResultSets = [];
    vm.indexerDetails = [];
    vm.searcherDetails = [];
    vm.loading = true;
    vm.selectedIndex = null;
    vm.selectedSearcher = null;
    vm.searchResults = null;
    vm.searchResults2 = null;
    vm.showSearchResultFields = [];
    vm.showSearchResultFields2 = [];
    vm.examineDashboardUrl = '/umbraco#/settings?dashboard=settingsExamine';
    vm.showSearchResultDialog = function showSearchResultDialog(values) {
        vm.searchResults && localizationService.localize("examineManagement_fieldValues").then(function (value) {
            editorService.open({
                title: value,
                searchResultValues: values,
                size: "medium",
                view: "views/dashboard/settings/examinemanagementresults.html",
                close: function close() {
                    editorService.close()
                }
            })
        })
    };
    function init() {
        $q.all(
            [
                umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl("examineMgmtBaseUrl", "GetIndexerDetails")), "Failed to retrieve indexer details"),
                umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl("examineMgmtBaseUrl", "GetSearcherDetails")), "Failed to retrieve searcher details")
            ]
        ).then(function ([indexerDetails, searcherDetails]) {
            vm.indexerDetails = indexerDetails;
            vm.searcherDetails = searcherDetails;
            if (vm.indexerDetails) {
                for (var i = 0; i < vm.indexerDetails.length; i++) {
                    var indexName = vm.indexerDetails[i].name;
                    if (indexName != 'MembersIndex') {
                        search(indexName);
                    }
                }
            }
            vm.loading = false
        })
    }
    function search(searcherName) {
        umbRequestHelper.resourcePromise($http.get(umbRequestHelper.getApiUrl("examineMgmtBaseUrl", "GetSearchResults", {
            searcherName: searcherName,
            query: encodeURIComponent('__NodeId:' + editorState.current.id),
            pageIndex: 0
        })), "Failed to search").then(function (searchResults) {
            vm.searchResultSets.push({ indexName: searcherName, searchResults: searchResults });
            vm.searchResults = searchResults,
                vm.searchResults.pageNumber = 1,
                vm.searchResults.totalPages = Math.ceil(vm.searchResults.totalRecords / 20),
                _.each(vm.searchResults.results, function (result) {
                    var section = result.values.__IndexType[0];
                    switch (section) {
                        case "content":
                        case "media":
                            result.editUrl = "/" + section + "/" + section + "/edit/" + result.values.__NodeId[0],
                                result.editId = result.values.__NodeId[0],
                                result.editSection = section;
                            break;
                        case "member":
                            result.editUrl = "/member/member/edit/" + result.values.__Key[0],
                                result.editId = result.values.__Key[0],
                                result.editSection = section
                    }
                })
        })
    }
    init();
}
angular.module("umbraco").controller("Umbraco.Dashboard.ExamineContentAppController", ExamineContentAppController)