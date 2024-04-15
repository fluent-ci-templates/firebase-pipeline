use anyhow::Error;
use fluentci_pdk::dag;

pub fn setup_firebase(version: String) -> Result<String, Error> {
    let version = if version.is_empty() {
        "latest".to_string()
    } else {
        version
    };

    let mut node_version = dag().get_env("NODE_VERSION").unwrap_or_default();
    if node_version.is_empty() {
        node_version = "latest".to_string();
    }

    let stdout = dag()
        .pkgx()?
        .with_packages(vec!["bun", &format!("firebase@{}", version)])?
        .with_exec(vec![&format!(
            "type node > /dev/null || pkgx install node@{}",
            node_version,
        )])?
        .stdout()?;
    Ok(stdout)
}
