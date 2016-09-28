using UnityEngine;
using System.Collections;
using System;

[Serializable]
public class AssistedPerformerObj
{
    public string assisted_performer;
    public AssistedPerformerParameters parameters;
}

[Serializable]
public class AssistedPerformerParameters
{
    public AssistedPerformerValues banana;
}

[Serializable]
public class AssistedPerformerParametersReceived
{
    public float banana = -666;
}

[Serializable]
public class AssistedPerformerValues
{
    public string friendly_name;
    public float min;
    public float max;
    public float step;
    public float default_value;
    public float value;
}

public class AssistedPerformer : MonoBehaviour {

    public string url = "ws://127.0.0.1:3001";
    private bool websockets_on = false;
    private DateTime websockets_failed = System.DateTime.Now;
    private AssistedPerformerObj assis;

    // Use this for initialization
    void Start() {
        AssistedPerformerObj assis = new AssistedPerformerObj();
        assis.assisted_performer = "canvas";
        assis.parameters = new AssistedPerformerParameters();
        assis.parameters.banana = new AssistedPerformerValues();
        assis.parameters.banana.friendly_name = "Banana";
        assis.parameters.banana.min = 0.0f;
        assis.parameters.banana.max = 10.0f;
        assis.parameters.banana.step = 1.0f;
        assis.parameters.banana.default_value = 5.0f;
        assis.parameters.banana.value = 5.0f;
		
		StartCoroutine(ConnectWebsockets());
    }
	
	IEnumerator ConnectWebsockets() {
		websockets_on = true;
        
		string json = JsonUtility.ToJson(assis);
        //private string ws_params_string = "{ \"assisted_performer\": \"canvas\", \"params\": { \"banana\": { \"min\": 0.0, \"max\": 10.0, \"step\": 0.1, \"default\": 0.5, \"value\": 0.5 } } }";

        //WebSocket w = new WebSocket(new Uri("ws://echo.websocket.org"));
        WebSocket w = new WebSocket(new Uri(url));
        yield return StartCoroutine(w.Connect());
        w.SendString(json);
        int i=0;
        while (true)
        {
            string reply = w.RecvString();
            if (reply != null)
            {
                AssistedPerformerParametersReceived items = JsonUtility.FromJson<AssistedPerformerParametersReceived>(reply);
                Debug.Log(reply + ' ' + (i++) + ' ' + items.banana);
                if (items != null)
                {
                    //if (items.edgesOnly != -666) ((EdgeDetection)gameObject.GetComponent("EdgeDetection")).edgesOnly = (float)items.edgesOnly;
                    //if (items.sampleDist != -666) ((EdgeDetection)gameObject.GetComponent("EdgeDetection")).sampleDist = (float)items.sampleDist;
                    //if (items.sensitivityNormals != -666) ((EdgeDetection)gameObject.GetComponent("EdgeDetection")).sensitivityNormals = (float)items.sensitivityNormals;
                    //if (items.scanLineJitter != -666) ((AnalogGlitch)gameObject.GetComponent("AnalogGlitch")).scanLineJitter = (float)items.scanLineJitter;
                    //if (items.colorDrift != -666) ((AnalogGlitch)gameObject.GetComponent("AnalogGlitch")).colorDrift = (float)items.colorDrift;
                }

            }
           if (w.error != null)
			{
                websockets_on = false;
                websockets_failed = System.DateTime.Now;
                Debug.Log("Error on websockets");
				break;
			}
            yield return 0;
        }
        w.Close();
	}
	
	
    void Update()
    {
        DateTime thistime = System.DateTime.Now;
        //Debug.Log("updating? " + websockets_on + " " + thistime + " " + websockets_failed + " diff: " + thistime.Subtract(websockets_failed).TotalSeconds);

        if (!websockets_on && (thistime.Subtract(websockets_failed).TotalSeconds > 5))
        {
            //Debug.Log("restarting websockets attempt");
            websockets_failed = System.DateTime.Now;
            StartCoroutine(ConnectWebsockets());
        }
    }
}
