const Alexa = require('ask-sdk-core');
const Axios = require('axios');
 
var token = 'a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6';
var config = {
    headers: {'Authorization': 'Bearer ' + token}
};
var vehicleId = '';

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the voice driven car management! To get a list of all commands say help.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(helpMessage)
      //.withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const GetAllCarsIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'get_all_cars';
  },
  handle(handlerInput) {
       console.log('GetAllCarsIntentHandler handlerInput.requestEnvelope.request - ', handlerInput.requestEnvelope.request);
      //const result = 'Hello World!';
      return getAllCars().then(result => {

        console.log('GetAllCarsIntentHandler result - ', result);
        return handlerInput.responseBuilder
        .speak(result)
        //.withSimpleCard('Hello World', speechText)
        .getResponse();
      }).catch((err) => {
        // Handle any error that occurred in any of the previous
        // promises in the chain.
        console.log('Error: ', err);
      });   
      
  },
};

const GetAllDoorStatusIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'get_door_status';
  },
  handle(handlerInput) {
       console.log('GetAllDoorStatusIntentHandler handlerInput.requestEnvelope.request - ', handlerInput.requestEnvelope.request);
      //const result = 'Hello World!';
      return getAllDoorStatus().then(result => {

        console.log('GetAllDoorStatusIntentHandler result - ', result);
        return handlerInput.responseBuilder
        .speak(result)
        //.withSimpleCard('Hello World', speechText)
        .getResponse();
      }).catch((err) => {
        // Handle any error that occurred in any of the previous
        // promises in the chain.
        console.log('Error: ', err);
      });   

  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {

    return handlerInput.responseBuilder
      .speak(helpMessage)
      .reprompt(helpMessage)
      //.withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      //.withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    let resultErr = JSON.stringify(handlerInput.requestEnvelope.request);
    console.log(`Session ended with request: `, resultErr);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const welcomeMessage = `Welcome to controlling your car via Alexa!`;
const exitSkillMessage = `Thank you for using Alexa for managing your car. Hope to see you back soon!`;
const helpMessage = `You can manage your mercedes by giving out voice commands. You can ask me about all the cars that you have and I'll tell you what I know. The command will be get all cars. You can also give commands like door status to know whether the doors in your car are locked or unlocked. You can also give command to lock all your doors by using the phrase lock doors or to unlock all your doors in your car by the phrase unlock doors. What would you like to do?`;


function getAllCars() {
  //return 'Your car id is wewerwerwer' + ' with the license plate number of werwer' ;
  return Axios.get( 
        'https://api.mercedes-benz.com/experimental/connectedvehicle_tryout/v1/vehicles',
        config
    ).then((response) => {
        console.log(response.data);
        vehicleId = response.data[0].id;
        console.log('Vehihcle ID: ', vehicleId);
        return 'Your car id is ' + vehicleId + ' with the license plate number of ' + response.data[0].licenseplate;

    }).catch((error) => {
        console.log(error);
        return 'You don\'t own any cars.';
    });


}

function getAllDoorStatus() {
  let doorDetailUrl = 'https://api.mercedes-benz.com/experimental/connectedvehicle_tryout/v1/vehicles'
            + '/' + vehicleId
            + '/doors';

  console.log('Doors: ', doorDetailUrl);
  doorDetailUrl = 'https://api.mercedes-benz.com/experimental/connectedvehicle_tryout/v1/vehicles/1234567890ABCD1234/doors';

  console.log('Doors: ', doorDetailUrl);

  return Axios.get( 
        doorDetailUrl,
        config
    ).then((response) => {
      console.log('Front left door:', response.data.doorlockstatusfrontleft.value);
      console.log('Front right door:', response.data.doorlockstatusfrontright.value);
      console.log('Rear left door:', response.data.doorlockstatusrearleft.value);
      console.log('Rear right door:', response.data.doorlockstatusrearright.value);
      console.log('Deck lid:', response.data.doorlockstatusdecklid.value);
      console.log('Gas cap lock status:', response.data.doorlockstatusgas.value);
      console.log('Vehicle lock status:', response.data.doorlockstatusvehicle.value);   

      if(response.data.doorlockstatusvehicle.value  == 'LOCKED') {
        return 'Your vehicle is locked.';
      } else {
        return 'Your vehicle is unlocked. '
          + 'Your front left door is ' + response.data.doorlockstatusfrontleft.value
          + '. Your front right door is ' + response.data.doorlockstatusfrontright.value
          + '. Your rear left door is ' + response.data.doorlockstatusrearleft.value
          + '. Your rear right door is ' + response.data.doorlockstatusrearright.value
          + '. Your deck lid is ' + response.data.doorlockstatusdecklid.value
          + '. Your gas cap is ' + response.data.doorlockstatusgas.value
          + '.';        
      }
    }).catch((error) => {
        console.log(error);
        return 'You don\'t own any cars.';
    });
}

/*
function lockUnlockAllDoors(item) {
  let doorDetailUrl = 'https://api.mercedes-benz.com/experimental/connectedvehicle_tryout/v1/vehicles' + 
            + '/' + vehicleId
            + '/doors';

  console.log('Doors: ', doorDetailUrl);
  doorDetailUrl = 'https://api.mercedes-benz.com/experimental/connectedvehicle_tryout/v1/vehicles/1234567890ABCD1234/tires';

  console.log('Doors: ', doorDetailUrl);

  if(item == 'lock') {

  } else if (item == 'unlock') {

  } else {
    console.log('Invalid status: ', item);
    return;
  }

  Axios.get( 
        doorDetailUrl,
        config
    ).then((response) => {
        console.log(response.data);
    }).catch((error) => {
        console.log(error);
    });
}
*/

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GetAllCarsIntentHandler,
    GetAllDoorStatusIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
