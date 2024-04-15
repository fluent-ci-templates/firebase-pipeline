use extism_pdk::*;
use fluentci_pdk::dag;

use crate::helpers::setup_firebase;

pub mod helpers;

#[plugin_fn]
pub fn setup(version: String) -> FnResult<String> {
    let stdout = setup_firebase(version)?;
    Ok(stdout)
}

#[plugin_fn]
pub fn build() -> FnResult<String> {
    setup_firebase("latest".to_string())?;
    let stdout = dag()
        .pkgx()?
        .with_exec(vec!["bun", "install"])?
        .with_exec(vec!["bun", "run", "build"])?
        .stdout()?;
    Ok(stdout)
}

#[plugin_fn]
pub fn deploy(args: String) -> FnResult<String> {
    setup_firebase("latest".to_string())?;
    let stdout = dag()
        .pkgx()?
        .with_exec(vec![
            "firebase",
            "deploy",
            "--non-interactive",
            "--token",
            "$FIREBASE_TOKEN",
            &args,
        ])?
        .stdout()?;
    Ok(stdout)
}
