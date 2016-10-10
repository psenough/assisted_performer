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

    // Use this for initialization
    IEnumerator Start() {

        AssistedPerformerObj assis = new AssistedPerformerObj();
        assis.assisted_performer = "canvas";
        assis.parameters = new AssistedPerformerParameters();
        assis.parameters.banana = new AssistedPerformerValues();
        assis.parameters.banana.min = 0.0f;
        assis.parameters.banana.max = 10.0f;
        assis.parameters.banana.step = 1.0f;
        assis.parameters.banana.default_value = 5.0f;
        assis.parameters.banana.value = 5.0f;
        
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
				Debug.Log ("Received: "+reply);
				//w.SendString("Hi there"+i++);
                

			}
			if (w.error != null)
			{
				Debug.LogError ("Error: "+w.error);
				break;
			}
			yield return 0;
		}
		w.Close();
	}
}
