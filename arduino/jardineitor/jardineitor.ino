#include <HTTPClient.h>
#include <SPI.h>
#include <Ethernet.h>

//Serial configuration
int SERIAL_FREQ = 9600;

//Pin locations
int LIGHT_PIN = 1;
int MOISTURE_PIN = 2;
int RELAY_PIN = 5;

//Measure configuration
int PREVIOUS_TIME = 0;
int MEASURE_TIME = 1000;
int LOOP_NBR = 0;
int CURRENT_MEASURE = 0;
int MEASURES_NBR = 5;

int LIGHT_MEASURES[] = {
  0, 0, 0, 0, 0
};

int MOISTURE_MEASURES[] = {
  0, 0, 0, 0, 0
};

//Ethernet configuration
byte MAC_ETHERNET[] = {
  0xDE, 0xAD, 0xBE, 0xEF, 0xD0, 0x0D
};

byte SERVER[] = {192, 168, 1, 100};
char CHECK_WATER_STATUS[] = "/arduino/water";
int NETWORK_TIMEOUT = 30 * 1000;

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

void takeMeasure() {
  LIGHT_MEASURES[CURRENT_MEASURE] = analogRead(LIGHT_PIN);
  MOISTURE_MEASURES[CURRENT_MEASURE] = analogRead(MOISTURE_PIN);
  Serial.print("Medicion actual ");
  Serial.print("Luz: ");
  Serial.println(LIGHT_MEASURES[CURRENT_MEASURE]);
  Serial.print("Humedad: ");
  Serial.println(MOISTURE_MEASURES[CURRENT_MEASURE]);
  
  CURRENT_MEASURE += 1;
  if(CURRENT_MEASURE == MEASURES_NBR) {
    int light_sum = 0;
    int moisture_sum = 0;
    
    CURRENT_MEASURE = 0;
    
    for(int i = 0; i < MEASURES_NBR; i++) {
      light_sum += LIGHT_MEASURES[i];
      moisture_sum += MOISTURE_MEASURES[i];
    }
    float light_result = (light_sum / MEASURES_NBR);
    float moisture_result = (moisture_sum / MEASURES_NBR);
    if(light_result < 299) {
      waterPlant();
    }    
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

  FILE* result = http.getURI("/arduino/water");
  int status = http.getLastReturnCode();
  if(result != NULL) {
    fscanf(result, "%s", response);
    http.closeStream(result);
  }
  Serial.println(response);
  if(!strcmp(response, "yes") || strlen(response) == 0) {
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
  //takeMeasure();
  delay(1000);
}
