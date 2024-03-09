# Firebase Pipeline

[![fluentci pipeline](https://img.shields.io/badge/dynamic/json?label=pkg.fluentci.io&labelColor=%23000&color=%23460cf1&url=https%3A%2F%2Fapi.fluentci.io%2Fv1%2Fpipeline%2Ffirebase_pipeline&query=%24.version)](https://pkg.fluentci.io/firebase_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.41)
[![dagger-min-version](https://img.shields.io/badge/dagger-v0.10.0-blue?color=3D66FF&labelColor=000000)](https://dagger.io)
[![](https://jsr.io/badges/@fluentci/firebase)](https://jsr.io/@fluentci/firebase)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/firebase-pipeline)](https://codecov.io/gh/fluent-ci-templates/firebase-pipeline)
[![ci](https://github.com/fluent-ci-templates/firebase-pipeline/actions/workflows/ci.yml/badge.svg)](https://github.com/fluent-ci-templates/firebase-pipeline/actions/workflows/ci.yml)

A ready-to-use CI/CD Pipeline for deploying your application to [firebase](https://firebase.google.com/) hosting.

## 🚀 Usage

Run the following command:

```bash
fluentci run firebase_pipeline
```

Or, if you want to use it as a template:

```bash
fluentci init -t firebase
```

This will create a `.fluentci` folder in your project.

Now you can run the pipeline with:

```bash
fluentci run .
```

Or simply:

```bash
fluentci
```

## 🧩 Dagger Module

Use as a [Dagger](https://dagger.io) Module:

```bash
dagger install github.com/fluent-ci-templates/firebase-pipeline@main
```

Call a function from the module:

```bash
dagger call build --src .
dagger call deploy --src . --token env:FIREBASE_TOKEN
```

## 🛠️ Environment Variables

| Variable       | Description                   |
|----------------|-------------------------------|
| FIREBASE_TOKEN | Your firebase Access Token    |

## ✨ Jobs

| Job         | Description                                                |
|-------------|------------------------------------------------------------|
| build       | Build your project.                                        |
| deploy      | Deploy to firebase hosting.                                |

```typescript
build(
  src: string | Directory | undefined = "."
): Promise<Directory | string>

deploy(
  src: string | Directory | undefined = ".",
  token?: string | Secret
): Promise<string>
```

## 👨‍💻 Programmatic usage

You can also use this pipeline programmatically:

```typescript
import { deploy } from "jsr:@fluentci/firebase";

await deploy(".");
```
