mPhone lets you print voicemails and text messages. Once setup, you'll have a custom mPhone telephone number for your mPrinter. You'll be able to print voicemails and text messages when people call or text you.

*By Adam Varga / [@varga](https://twitter.com/varga)*

Known Issues
-----------------------------

* If we modify this mPrint's code after you've installed it, you'll still be running the old version. Check back here from time to time, to see if the current mPhone version is newer than the version you've installed.

Requirements
-----------------------------

* An mPrinter
* A *free trial* or *paid* [Twilio](http://www.twilio.com) Account. Note that *free trial* accounts have some [limitations that will affect mPhone](http://www.twilio.com/help/faq/twilio-basics/how-does-twilios-free-trial-work):
    * You won't be able to print voicemail transcriptions
    * You won't be able to create additional phone numbers. You'll have to use the phone number provisioned when you setup your account with Twilio.
    * Calls to your mPhone number will hear a short annoying message before the "leave a message" prompt.
    * These limitations are outside of our control. If you'd like to remove any of these limitations, [upgrade your Twilio account](https://www.twilio.com/user/billing/upgrade).

Setup
-----------------------------

1. Go to [http://manage.themprinter.com/mprints/details/51d77ecdf70787000000005c](http://manage.themprinter.com/mprints/details/51d77ecdf70787000000005c) and click "+ Add to My mPrints."
2. Go to [My mPrints](http://manage.themprinter.com/mprints), and click the mPhone app. You should be at a URL that looks like http://manage.themprinter.com/mprints/edit/XXXXXXXXXXXXXXXXXXXXXXXX. Take note of the XXXXXXXXXXXXXXXXXXXXXXXX's. That's your mPhone's mprint_id.
3. Go to the Options tab.
  * Enter your Twilio Account SID and Auth Token. These can be found on your [Twilio account dashboard](https://www.twilio.com/user/account).
  * Configure any additional options.
4. Setup a phone number.
  * Go to XXXXXXXXXXXXXXXXXXXXXXXX.mprinter.io (replace the XXXXXXXXXXXXXXXXXXXXXXXX's with your mprint_id).
  * To setup a new number:
        * Click "setup a new number"
        * Enter the area code you'd like for your mPhone telephone number.
        * A list of available phone numbers for that area code will appear. Click the "Use" button next to the phone number you want to use.
  * To use a number already associated with your Twilio account:
        * Click "use an existing number"
        * Search for the phone number you want to use.
        * A list of available phone numbers matching your search will appear. Click the "Use" button next to the phone number you want to use.

Source Code
-----------------------------

The source code for this mPrint lives at [https://github.com/abv/mPhone](https://github.com/abv/mPhone)
