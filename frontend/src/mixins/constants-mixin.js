import constants from "../constants";

export default {
    computed: {
        constants: function () {
            return {
                noStreetInfoCaption: constants.STRINGS.NO_STREET_INFO,
                chooseStreetCaption: constants.STRINGS.CHOOSE_THE_STREET,
                howToChooseStreet: constants.STRINGS.HOW_TO_CHOOSE_STREET,
                searchingCaption: constants.STRINGS.SEARCHING,
                namedAfterCaption: constants.STRINGS.NAMED_AFTER,
                streetNameCaption: constants.STRINGS.STREET_NAME,
                oldStreetNameCaption: constants.STRINGS.OLD_STREET_NAME,
                cityNotChosen: constants.STRINGS.CITY_NOT_CHOSEN,
                hideDetailsCaption: constants.STRINGS.HIDE_DETAILS,
                showDetailsCaption: constants.STRINGS.SHOW_DETAILS,
                imageCaption: constants.STRINGS.IMAGE,
                wikipediaLinkCaption: constants.STRINGS.WIKIPEDIA_LINK_CAPTION,
                streetInformationCaption: constants.STRINGS.STREET_INFORMATION,
                streetOnWikipediaCaption: constants.STRINGS.STREET_ON_WIKIPEDIA,
                categoriesCaption: constants.STRINGS.CATEGORIES,
                searchPlaceholder: constants.STRINGS.SEARCH_PLACEHOLDER,
                searchLabel: constants.STRINGS.SEARCH_LABEL,
                hide: constants.STRINGS.HIDE
            };
        }
    }
};