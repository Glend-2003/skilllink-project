### 3. Para `auth-service` (C# / .NET)

```markdown
# Auth Service 

This microservice handles authentication and authorization (Login, Register, JWT Token generation). It is built using .NET.

## 🛠 Tech Stack
- **Framework:** .NET 8.0+
- **Language:** C#
- **Database:** MySQL (via `Pomelo.EntityFrameworkCore.MySql`)
- **Authentication:** JWT Bearer Authentication
- **Security:** BCrypt for password hashing (`BCrypt.Net-Next`)

## Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- [.NET SDK](https://dotnet.microsoft.com/download)
- MySQL Server (and MySQL Workbench recommended)

### 2. Configuration (`appsettings.json`)
Create or update the `appsettings.json` file in the project root. You must configure your Database Connection and JWT Secret.
```json
{
  "Jwt": {
    "Key": "SkillLink_Super_Secret_Key_2025_Unica",
    "Issuer": "SkillLink_Auth",
    "Audience": "SkillLink_Users"
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=skilllink_db;User=root;Password=root;"
  }
}
```

### 3. Installation & Restore
Navigate to the project directory and restore the NuGet packages:
# Restore project dependencies
```bash
dotnet restore
```

```bash
dotnet build
```

# Run the application
```bash
dotnet watch run
```