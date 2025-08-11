# Simple Currency Converter

A minimal currency converter web app using the free Frankfurter API (no API key needed).  
Includes a Node.js static server, Docker containerization, deployment instructions on two web servers, and load balancing with HAProxy.

---

The app can be accessed via this link  https://sheja-dorian.github.io/currency-converter/ 

Video Description https://us04web.zoom.us/clips/share/4mzdjtY8Quu1xMYTDLgkDw

## Image Details

- **Docker Hub Repository:** `https://hub.docker.com/r/ShejaDorian/currency-converter`  
- **Image Name:** `ShejaDorian/currency-converter`  
- **Tags:**  
  - `v1` — Initial release  
  - `latest` — Latest stable build  

---

## Build Instructions (Local)

From the project root folder:

```bash
docker build -t ShejaDorian/currency-converter:v1 .
````

Test locally by running:

```bash
docker run -d --name currency-app -p 8080:8080 ShejaDorian/currency-converter:v1
```

Visit [http://localhost:8080](http://localhost:8080) to verify the app works.

---

## Push to Docker Hub

```bash
docker login
docker push ShejaDorian/currency-converter:v1
docker tag ShejaDorian/currency-converter:v1 <dockerhub-username>/currency-converter:latest
docker push ShejaDorian/currency-converter:latest
```

Replace `ShejaDorian` with your Docker Hub username.

---

## Run Instructions on Web01 & Web02

SSH into each server (web01 and web02), then:

```bash
docker pull ShejaDorian/currency-converter:v1

docker run -d --name currency-app --restart unless-stopped -p 8080:8080 <dockerhub-username>/currency-converter:v1
```

Verify the app is running by checking:

```bash
curl http://web01:8080
curl http://web02:8080
```

---

## Load Balancer Configuration (HAProxy on lb01)

Edit `/etc/haproxy/haproxy.cfg` to include:

```haproxy
frontend http_front
    bind *:80
    default_backend currency_backend

backend currency_backend
    balance roundrobin
    server web01 172.20.0.11:8080 check
    server web02 172.20.0.12:8080 check
```

Reload HAProxy to apply changes:

```bash
docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
```

---

## Testing Steps & Evidence

1. Run multiple curl commands from your host or any client pointing to the load balancer IP or hostname:

```bash
curl http://<lb01-ip>
curl http://<lb01-ip>
curl http://<lb01-ip>
```

2. Confirm the responses alternate between the two backend servers (web01 and web02). Example response snippet:

```
<!-- Response from Web01 -->
Server: web01
...

<!-- Response from Web02 -->
Server: web02
...
```

This confirms load balancing is functioning correctly with round-robin distribution.

---

## Security & Hardening (Optional)

* The Frankfurter API does not require API keys, so no secrets are stored.
* If your app needs API keys in the future, pass them as environment variables at container runtime, for example:

```bash
docker run -d --name currency-app -p 8080:8080 -e API_KEY=$MY_API_KEY <dockerhub-username>/currency-converter:v1
```

* This approach prevents secrets from being baked into the Docker image.

---

## Credits

* Exchange rates: [Frankfurter API](https://www.frankfurter.app/)
* Charting library: [Chart.js](https://www.chartjs.org/)

```

---

**Replace** `ShejaDorian` and `<lb01-ip>` with your actual Docker Hub username and load balancer IP respectively before submitting.

If you want, I can also help generate a sample test evidence snippet showing alternating responses for your README!
``


