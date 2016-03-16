/**
 * @file JSDoc custom type definitions. Add your global typedefs here!
 */

/**
 * A jQuery object.
 *
 * @typedef {function} jquery
 * @property {function} proxy
 */

/**
 * A promise from a jquery ajax request.
 *
 * @typedef {Object} jqXHR
 */

/**
 * A json object.
 * @typedef {Object} JSON
 * @typedef {JSON} json
 */

/**
 * An integer. e.g. 1, 600, -4, 0
 * @typedef {number} Int
 */

/**
 * A URL string. e.g. "/image1.jpg", "http://lexus.com/"
 * @typedef {String} URL
 */

/**
 * Phone number or fax number.
 * @typedef {String} Phone
 */

/**
 * Zip Code (5 or 9 digits)
 * @typedef {String} ZipCode
 */

/**
 * Email Address
 * @typedef {String} Email
 */

/**
 * A listener function.
 * @typedef {Function} listener
 */

/**
 * A configuration parameter used for functions with many optional params.
 * @typedef {Object} config
 */

/**
 * An image with source and title.
 * @typedef {{src:URL,title:string}} Image
 */

/**
 * A disclaimer.
 * Currently just a string but referenced with a typedef in case it becomes more complex.
 *
 * @typedef {string} Disclaimer
 */

/**
 * Gallery initialization json. Serialized data from the webapp.
 *
 * @typedef {object} GalleryJSON
 * @property {Array.<json>} items
 * @property {string} trimId
 * @property {string} trimGroupName
 */

/**
 * A handler for a SelectedItemChanged event.
 *
 * @typedef {function(newItem:*,oldItem:*)} SelectedItemChangedListener
 */

/**
 * Swatch configuration data.
 * @typedef {{image:Image, name:string}} SwatchConfig
 */


/**
 * SwatchGroup configuration data.
 * @typedef {{ numberOfAngles:int, swatches:Array.<SwatchConfig>}} SwatchGroupConfig
 */


/**
 * TrimVisualizer configuration data.
 * @typedef {{
 *     exteriorColors: SwatchGroupConfig,
 *     interiorColors: SwatchGroupConfig,
 *     wheels: SwatchGroupConfig
 *     year: int,
 *     seriesName: string
 *     trimName: string
 * }} TrimVisualizerConfig
 */

/**
 * Visualizer configuration data.
 * @typedef {{
 *      visualizerTrimGroups: Array.<TrimVisualizerConfig>,
 *      disclaimer: Disclaimer,
 *      strings:{
 *          exteriorColors:SwatchGroupStrings,
 *          interiorColors:SwatchGroupStrings,
 *          wheels:SwatchGroupStrings
 *     }
 * }} VisualizerConfig
 */


/**
 * Strings for defining swatch group labels.
 *
 * @typedef {{selectText: string, title:string}} SwatchGroupStrings
 */

/**
 * JSON response from DIS.
 *
 * @typedef {{
 *      id:String,
 *      dealerName:String,
 *      dealerAddress: DealerAddressConfig,
 *      dealerThumbnailDesktop:URL,
 *      dealerThumbnailMobile:URL,
 *      dealerOverlayImages:Array.<URL>,
 *      dealerKeyContactImages:Array.<URL>,
 *      dealerKeyContactPhoneNumbers:Array.<Phone>,
 *      dealerPhone:Phone?,
 *      dealerFax:Phone,
 *      dealerMobileUrl:URL,
 *      dealerTabletUrl:URL,
 *      dealerWebUrl:URL,
 *      dealerEmail:Email,
 *      dealerDistance:Number?,
 *      dealerLatitude:Number,
 *      dealerLongitude:Number,
 *      dealerLogoURI:URL,
 *      dealerLocationImageURI:URL,
 *      dealerServiceUrl:URL,
 *      dealerPreOwnedInventoryUrl:URL,
 *      dealerContactWebUrl:URL,
 *      dealerDetailSlug:String,
 *      hoursOfOperation:Object,
 *      dealerKeyContacts:Array,
 *      marketName:String,
 *      marketNames:Array.<String>,
 *      dealerServices:Array.<DealerServiceConfig>,
 *      eliteStatus:Boolean
 * }} DealerConfig
 */
/**
 * @typedef {{
 *          address1:String,
 *          address2:String,
 *          zipCode:ZipCode,
 *          zipCodeFive:ZipCode,
 *          state:String,
 *          city:String
 *      }} DealerAddressConfig
 */
/**
 * @typedef {{
 *      serviceType:String,
 *      code: String,
 *      name:String,
 *      description: String
 * }} DealerServiceConfig
 */


/**
 * Lead form analytics bundle.
 * @typedef {{
 *              zip: ZipCode,
                dealerName: string,
                didCheckAllowDealerToContact: boolean,
                didCheckSendMeCPO: boolean,
                didCheckSendMeFinancialInfo: boolean
            }} LeadFormAnalyticsBundle
 */

/**
 * Social data
 * @typedef {{googlePlus: OpenGraphContent, openGraph: OpenGraphContent, twitter: TwitterContent, mail: SocialMailContent }} SocialContent
 */

/**
 * Twitter share data
 * @typedef {{
 *      card:string,
 *      creator:string,
 *      description: string,
 *      image: URL,
 *      title: string,
 *      url: URL
 *  }} TwitterContent
 */

/**
 * OpenGraph content
 * @typedef {{
 *      admins: string,
 *      description: string,
 *      image: URL,
 *      siteName: string,
 *      title: string,
 *      type: string,
 *      url: URL
 * }} OpenGraphContent
 */

/**
 * @typedef {{
 *      subject: string,
 *      body: string
 * }} SocialMailContent
 */

/**
 * @typedef {{
 *     status:String,
 *     action:String,
 *     arguments:Array,
 *     ownerID:String,
 *     callbackID:String,
 *     timeout:Number,
 *     performance: {
 *          startTime:Number,
 *          sendTime:Number,
 *          responseStart:Number,
 *          responseEnd:Number,
 *          endTime:Number
 *     },
 *     data:{
 *          visitorID:String,
 *          visit:{
 *              id:String,
 *              start:Number,
 *              modified:Number,
 *              expires:Number,
 *              tabs:Number,
 *              tabNumber:Number}
 *          }
 *     }
 * }} AnalyticsMessageEventData
 */

/**
 * @callback AnalyticsHandler
 * @param event {MessageEvent}
 */
