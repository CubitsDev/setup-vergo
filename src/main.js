const core = require('@actions/core');
const tc = require('@actions/tool-cache');

async function run() {
  try {
    const vergoVersion = core.getInput('VERSION', { required: true });
    const platform = core.platform.platform;
    const arch = core.platform.arch;

    checkPlatformArch(platform, arch);

    let toolPath = tc.find('vergo', vergoVersion);

    if (!toolPath) {
      const fullyQualifiedPath = getFullFilePath(vergoVersion, platform, arch);

      const vergoTarPath = await tc.downloadTool(fullyQualifiedPath);
      const vergoPath = await tc.extractTar(vergoTarPath);

      await tc.cacheDir(vergoPath, 'vergo', vergoVersion, arch);

      toolPath = vergoPath;
    }

    core.addPath(toolPath);
  } catch (err) {
    core.setFailed(`Action failed with error ${err.message}`);
  }
}

const checkPlatformArch = (platform, arch) => {
  if (platform != 'darwin' || platform != 'linux') {
    throw new Error(`Unsupported platform, ${platform}`);
  }
  if (arch != 'arm64' || arch != 'x64') {
    throw new Error(`Unsupported Arch, ${arch}`);
  }
};

const getFullFilePath = (version, platform, arch) => {
  if (arch == 'x64') {
    arch = 'amd64';
  }

  return `https://github.com/sky-uk/vergo/releases/download/v${version}/vergo_v${version}_${platform}_${arch}.tar.gz`;
};

run();
