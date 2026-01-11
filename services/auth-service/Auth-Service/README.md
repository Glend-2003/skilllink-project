### 3. Para `auth-service` (C# / .NET)
*Guarda esto en: `services/auth-service/README.md`*
*(Como este es en C#, los comandos cambian a `dotnet`)*

```markdown
# Auth Service 

This microservice handles authentication and authorization (Login, Register, JWT Token generation). It is built using .NET.

## 🛠 Tech Stack
- **Framework:** .NET (Core / 6+)
- **Language:** C#
- **Identity:** JWT Bearer Authentication

## Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- .NET SDK
- SQL Server (if applicable for Identity)

### 2. Installation & Restore
Navigate to the project directory and restore the NuGet packages:
# Restore project dependencies
```bash
dotnet restore
```

# Run the application
```bash
dotnet watch run
```