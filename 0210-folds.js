// :set foldmethod=indent
// :set fdm=indent
// zo   Open a fold
// zc   Close a fold
// zO   Open a fold and all it's subfolds
// zr   Reduce folding level by one throughout
// zR   Open all folds
// zm   More folds. Closes lower-level folds throuhout
// zM   Close all folds
var SearchResultsView = Backbone.View.extend({
	initialize : function(options) {
        
        var r = function() {
            // This is a pointless function with a bunch of nesting
            var s = function() {
                // This is a function with more nesting
                var t = function() {
                    var x = 2;
                    var y = 3;
                    var z = 4;
                    return x + y + z;
                };
                return t();
            };
            return s();
        };
		var view = this;
		this.LOG.debug('Initializing SearchResultsView with options:', options);
		if (!options.model) throw new Error('SearchResultsView was not initialized with a SearchQueryModel');

		// Initialize Spinner
		this.spinner = new Spinner(SPINNER_CONFIG);

		// Cache app DOM selector
		this.$app = $(this.app);

		// Attach Model to View
		this.model = options.model;
		this.model.on('change parse error', this.render, this);
		this.model.on('request', this.showSpinner, this);

		// Initialize Instant Search
		this.renderInstantSearchView = _.debounce(this.updateQuery, 500);

		// Initialize typeahead UI Component
		this.LOG.debug("typeahead component", $(SELECTORS.searchInput));
		$(SELECTORS.searchInput).typeahead(TYPEAHEAD_CONFIG);
	},

	/**
	 * Rendering the search results view. Calls the server for an HTML
	 * fragment of search results, focuses the search input box, and
	 * initializes the popover code that enables the thumbnanil hover
	 * effect.
	 */
	render : function(model, response) {
		this.LOG.debug('Rendering SearchResults view', arguments);
		var view = this;
		var renderingContext = this.model.toContext();

		// Validate response
		renderingContext.error = (response && response.status === 500);

		// Render View
		var templateOutput = this.template(renderingContext);
		this.$app.html(templateOutput);

		// Update route
		this.updateRouter();

		// Update typeahead UI Component
		$(SELECTORS.searchInput).typeahead(TYPEAHEAD_CONFIG).val(this.model.get('q'));
		$(SELECTORS.searchBox).fadeIn('slow');
		
		if (this.model.get("autocomplete")) {
			var $toggleTypeaheadCheckbox = $(SELECTORS.toggleAutocomplete);
			$toggleTypeaheadCheckbox.attr('checked', true);
			this.toggleTypeahead();
		}

		// Initialize Bootstrap Popover on thumbnail images
		$(SELECTORS.popoverThumbnail).popover({
		    trigger : 'hover',
		    html : 'true', // Lets us insert HTML into the popover
		    content : function() {
		        // Set the height of the image manually. Otherwise,
		        // by the time the image loads, Bootstrap will have
		        // computed an incorrect position.
		        var height = $(this).attr('data-height');
		        var imageTag = sprintf('<img class="adi-popover" style="height:%spx" src="%s" alt="thumbnail"/>', height, $(this).attr('data-img-src-full'));

		        return imageTag;;
		    }
		});

        // Update Date Range Picker UI Component
        $('.daterangepicker').remove(); 
		var $dateRangePicker = $(SELECTORS.dateRangePicker)
		$dateRangePicker.daterangepicker(DATE_RANGE_PICKER_CONFIG, DATE_RANGE_PICKER_CONFIG.filterHandler);
		
		var currentDateRangeQuery = this.model.getDateRangeFilter() || DATE_RANGE_PICKER_CONFIG.ranges[DATE_RANGE_EVERYTHING_LABEL];
		DATE_RANGE_PICKER_CONFIG.filterHandler(currentDateRangeQuery[0], currentDateRangeQuery[1], $dateRangePicker);

		$dateRangePicker.on('change', $.proxy(view.updateDateRange, this));
	},

	/**
	 * Updates Date Range query
	 */
	updateDateRange : function(event) {		
		var $dateRangePicker = $(SELECTORS.dateRangePicker);
		
		var startDate = $dateRangePicker.data(START_DATE_DATA_ATTRIBUTE);
		var endDate = $dateRangePicker.data(END_DATE_DATA_ATTRIBUTE);
		
		this.model.setDateRangeFilter(startDate, endDate);
		this.model.fetch();
		
		LOG.log("Updating Date Range Filter: %s", this.model.get("q"), this.model.getQueryString());
	},

	/**
	 * Updates Router
	 */
	updateRouter : function() {
		router.navigate('search?' + this.model.getQueryString());
	},

	/**
	 * Show Spinner while view is loading and hide when completed
	 */
	showSpinner: function() {
		this.LOG.debug('Loading Search Results', arguments);
		if (this.$app.length > 0) {
			this.$app.html('');
			this.spinner.spin(this.$app[0]);
		}
	},

	/**
	 * Toggles Type-ahead functionality on Search Input
	 */
	toggleTypeahead: function(event) {
		var $toggleTypeaheadCheckbox = $(SELECTORS.toggleAutocomplete);
		var $searchInput = $(SELECTORS.searchInput);
		var enableTypeahead = $toggleTypeaheadCheckbox.is(":checked");
		$searchInput.data('autocomplete', enableTypeahead);
		
		if (enableTypeahead) {
			this.model.updateQuery({ autocomplete: enableTypeahead });
		} else {
			this.model.unset('autocomplete', { silent: true });
		}

		this.updateRouter();
		// if (enableAutocomplete) {
		// 	this.LOG.debug("Enabling Auto-complete");
		// 	$searchInput.typeahead(TYPEAHEAD_CONFIG);
		// } else {
		// 	this.LOG.debug("Disabling Auto-complete");
		// 	$searchInput.unbind();
		// }
	},

	/**
	 * Validates search query
	 */
	validateQuery : function(event) {
		var $searchInput = $(SELECTORS.searchInput);
		var $searchButton = $(SELECTORS.searchButton);
		var query = $searchInput.val();

		LOG.info("Validating query", event, query, this.model, this.model.get("q"));
		// Disable Search Input if query is unchanged
		// if (query === this.model.get("q")) {
		// 	LOG.debug("Ignoring query since it hasn't changed", $searchButton[0]);
		// 	$searchButton.addClass("disabled").attr("disabled", "disabled");
		// } else {
		// 	$searchButton.removeClass("disabled").removeAttr("disabled");
		// }

		// Validate query against lucene query parser
		// var isValidQuery;
		// try {
		// 	var parseTree = LuceneQueryParser.parse(query);
		// 	$searchButton.removeClass("btn-danger").addClass("btn-octopusInk").button("reset");
		// 	$searchInput.removeClass("error").addClass("success");
		// 	isValidQuery = true;
		// } catch (error) {
		// 	isValidQuery = false;
		// 	$searchButton.removeClass("btn-octopusInk").addClass("btn-danger").button("loading");
		// 	$searchInput.removeClass("success").addClass("error");
		// }

		// this.model.isValid = isValidQuery;
		// return isValidQuery;
		// return true;
	},

	/**
	 * Updates the query parameter in SearchQueryModel
	 */
	updateQuery : function(event) {
		event.preventDefault();
		
		// if (!this.validateQuery()) {
		// 	return;
		// }

		var $searchInput = $(SELECTORS.searchInput);
		var $searchButton = $(SELECTORS.searchButton);
		var query = $searchInput.val();

		// if (query === this.model.get('q')) {
		// 	this.LOG.debug("Ignoring query since it hasn't changed");
		// } else {
		// 	this.LOG.debug('Updating query with value from input field "' + query + '"');
		// 	this.model.updateQuery({ q : query, fq : [], page : 1 }); // Reset the page to 1 for the new query
		// 	this.model.fetch();
		// 	// $searchButton.addClass("disabled").attr("disabled", "disabled");
		// }
		// 
		this.LOG.debug('Updating query with value from input field "' + query + '"');
		this.model.updateQuery({ q : query, fq : [], page : 1 }); // Reset the page to 1 for the new query
		this.model.fetch();
	},

	/**
	 * Renders Instant Search Results without the user clicking on search button
	 * This function is setup when model is initialized
	 */
	renderInstantSearchView: null,

	/**
	 * Updates the page parameter.
	 */
	updatePage : function(e) {
		e.preventDefault();
		var page = $(e.currentTarget).attr('data-page');
		this.LOG.debug('Updating page to "' + page + '" after user click');
		// "Pages" in the web UI are always 1 greater than Solr's "start" parameter.
		this.model.set({ page : page }, { silent: true });
		this.model.fetch();
	},

	/**
	 * Updates the sort query
	 */
	updateSort : function(e) {
		e.preventDefault();
		var field = $(e.currentTarget).attr('data-field')
		  , order = $(e.currentTarget).attr('data-order');
		this.LOG.debug(sprintf('Updating sort query to %s %s and resetting to page 1', field, order));

		// The relevancy sort is default; we can just clear out the sort
		// property of the model.
		var sortFilter = (field === 'relevance') ? [] : [{ field : field, order : order }];
		this.model.set({ 
            sort : sortFilter,
            page : 1 // Reset the page when a new sort order is selected
        }, { silent: true });
		this.model.fetch();

		// Hide the dropdown menu
		$(this).closest('.dropdown-menu').hide();
	}
}

