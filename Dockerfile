FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

COPY backend/IncidentManager.Api/IncidentManager.Api.csproj backend/IncidentManager.Api/
RUN dotnet restore backend/IncidentManager.Api/IncidentManager.Api.csproj

COPY backend/ backend/

RUN dotnet publish backend/IncidentManager.Api/IncidentManager.Api.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["sh", "-c", "dotnet IncidentManager.Api.dll --urls http://0.0.0.0:${PORT:-10000}"]