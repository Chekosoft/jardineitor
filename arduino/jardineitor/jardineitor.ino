#include <HTTPClient.h>
#include <SPI.h>
#include <Ethernet.h>

//Serial configuration
int SERIAL_FREQ = 9600;

//Pin locations
int LIGHT_PIN = 1;
int MOISTURE_PIN = 0;
int RELAY_PIN = 5;


//Ethernet configuration
byte MAC_ETHERNET[] = {
  0xDE, 0xAD, 0xBE, 0xEF, 0xD0, 0x0D
};

byte SERVER[] = {192, 168, 1, 132};
char CHECK_WATER_URL[] = "/arduino/water";
char SEND_DATA_URL[] = "/arduino/status";
char STATUS_SEND[20];

EthernetClient ethClient;


void setup() {
  Serial.begin(SERIAL_FREQ);
  while(!Serial);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);

  Ethernet.begin(MAC_ETHERNET);
  while(!Ethernet.begin(MAC_ETHERNET)) {
    Serial.println("No ethernet, retrying");
  }
  Serial.print("Ethernet up, IP: ");
  Serial.println(Ethernet.localIP());
  
}

void sendMeasure() {
  int lightMeasure = analogRead(LIGHT_PIN);
  int moistureMeasure = analogRead(MOISTURE_PIN);
  sprintf(STATUS_SEND, "%d;%d", lightMeasure, moistureMeasure);
  Serial.println(STATUS_SEND);
  HTTPClient http("", SERVER, 3389);
  FILE* result = http.postURI(SEND_DATA_URL, NULL, STATUS_SEND, NULL);
  int returnCode = http.getLastReturnCode();
  Serial.println(returnCode);
  if(result != NULL) {
      http.closeStream(result);
  }
}

void waterPlant() {
  int waitTime = 750;
  int times = 5;
  while(times > 0) {
    digitalWrite(RELAY_PIN, LOW);
    delay(waitTime);
    digitalWrite(RELAY_PIN, HIGH);
    delay(waitTime * 5);
    times--;
  }
}


bool needsToWaterPlant() {
  int err= 0;
  int bodyLength = 0;
  int i = 0;
  long timeoutStart = millis();
  char response[5] = {'\0'};
  HTTPClient http("", SERVER, 3389);

  FILE* result = http.getURI(CHECK_WATER_URL);
  int status = http.getLastReturnCode();
  if(result != NULL) {
    fscanf(result, "%s", response);
    http.closeStream(result);
  }
  Serial.println(response);
  if(strcmp(response, "yes") || !strlen(response)) {
    return false;
  } else {
    return true;
  }
}


void loop() {
  bool needsWater = needsToWaterPlant();
  if(needsWater) {
    waterPlant();
  }
  sendMeasure();
  delay(1000);
}
