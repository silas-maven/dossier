import { Composition, Folder } from "remotion";
import { Dossier200UsersCelebration } from "./Dossier200UsersCelebration";
import { DossierHowToVideo } from "./DossierHowToVideo";

export const RemotionRoot = () => {
  return (
    <Folder name="Dossier">
      <Composition
        id="DossierHowToMarketing"
        component={DossierHowToVideo}
        durationInFrames={2220}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Build an parser-friendly CV in minutes",
          subtitle: "A free alternative to Zety, Resume.io, and other paid builders for jobseekers who need a clean, parser-friendly CV fast.",
        }}
      />
      <Composition
        id="Dossier200UsersCelebration"
        component={Dossier200UsersCelebration}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
  );
};
