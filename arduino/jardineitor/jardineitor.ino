#include <SPI.h>
#include <Ethernet.h>

//Serial configuration
int SERIAL_FREQ = 9600;

//Pin locations
int LIGHT_PIN = 1;
int MOISTURE_PIN = 3;
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

byte SERVER_IP[] = {
  192, 168, 1, 132
};


EthernetClient client;

void setup() {
  Serial.begin(SERIAL_FREQ);
  while(!Serial);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);

  //Ethernet.begin(MAC_ETHERNET, CLIENT_IP);
  //if(!Ethernet.begin(MAC_ETHERNET)) {
  //  Serial.println("No ethernet, stahp");
  ///  for(;;);
  //}
  
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

void sendMessage() {
  if(client.connect(SERVER_IP, 5000)) {
    client.println("GET /report?hola=arduino HTTP/1.0");
    client.println(); 
  }

  while (client.available()) {
    char c = client.read();
    Serial.print(c);
  }

  if (!client.connected()) {
    client.stop();
  }
}


void loop() {
  takeMeasure();
  delay(1000);
}
