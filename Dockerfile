FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8010 APP_ENV=production
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt && useradd --uid 10001 --create-home academy
COPY --chown=academy:academy frontend ./frontend
COPY --chown=academy:academy local_live ./local_live
RUN mkdir -p /app/.runtime && chown academy:academy /app/.runtime
USER academy
EXPOSE 8010
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD python -c "import os,urllib.request; urllib.request.urlopen('http://127.0.0.1:'+os.environ.get('PORT','8010')+'/api/health',timeout=3)"
CMD ["python", "local_live/local_live_server.py"]
