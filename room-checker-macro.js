

const xapi = require('xapi');

xapi.config.set("HttpClient Mode", "On");
xapi.config.set("HttpClient AllowHTTP", "True");
xapi.config.set("HttpClient AllowInsecureHTTPS", "True");
xapi.config.set("RoomAnalytics PeopleCountOutOfCall", "On");
xapi.config.set("RoomAnalytics PeoplePresenceDetector", "On");
xapi.config.set("RoomAnalytics AmbientNoiseEstimation Mode", "On");
xapi.config.set("Proximity Mode", "On");
xapi.config.set("Standby WakeupOnMotionDetection", "On");

const urlServerRoomsChecker = `http://websrv2.ciscofrance.com:15134/update`;

xapi.status.on("RoomAnalytics", (roomAnalytics) => {
  let data = {
    "Status": {
      "Identification": {
        "MACAddress": {
          
        },
        "IPAddress": {
          
        },
        "ProductID": {
          
        }
      },
      "RoomAnalytics": roomAnalytics
    }
  };
  
  
  
  
  xapi.status.get("Network 1 Ethernet MacAddress").then((macAddress) => {
    data.Status.Identification.MACAddress.Value = macAddress;
    
    xapi.status.get("Network 1 IPv4 Address").then((ipAddress) => {
      data.Status.Identification.IPAddress.Value = ipAddress;
      
      xapi.status.get("UserInterface ContactInfo Name").then((productId) => {
        data.Status.Identification.ProductID.Value = productId;
        
        xapi.command('HttpClient Post', { 
          Header: ["Content-Type: application/json"],
          AllowInsecureHTTPS: true,
          Url: urlServerRoomsChecker
        }, JSON.stringify(data))
        .catch((err) => {
          console.log(err);
        });
      });
    });
  });
});