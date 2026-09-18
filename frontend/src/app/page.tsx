"use client";

import { useEffect, useMemo, useState } from "react";
import type { StudentData } from "@/lib/types";
import * as storage from "@/lib/storage";
import { calculateStatus } from "@/lib/calculate";
import { formatStatusSummary } from "@/lib/formatStatus";
import Onboarding from "@/components/Onboarding";
import Header, { type TabId } from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import MajorCourses from "@/components/MajorCourses";
import GeneralCourses from "@/components/GeneralCourses";
import ChatWidget from "@/components/ChatWidget";
import Settings from "@/components/Settings";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<StudentData | null>(null);
  const [tab, setTab] = useState<TabId>("dashboard");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setData(storage.loadData());
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const current = useMemo(
    () =>
      data
        ? calculateStatus(
            data.requirements,
            data.majorCourseStatus,
            data.generalCourseStatus,
            data.generalCourses,
            data.fieldTraining,
            false
          )
        : null,
    [data]
  );
  const projected = useMemo(
    () =>
      data
        ? calculateStatus(
            data.requirements,
            data.majorCourseStatus,
            data.generalCourseStatus,
            data.generalCourses,
            data.fieldTraining,
            true
          )
        : null,
    [data]
  );

  if (!ready) return null;

  if (!data) {
    return (
      <Onboarding
        onSubmit={(year) => {
          setData(storage.initData(year));
        }}
      />
    );
  }

  return (
    <>
      <Header
        admissionYear={data.requirements.admissionYear}
        department={data.requirements.department}
        tab={tab}
        onTabChange={setTab}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-6">
        {tab === "dashboard" && current && projected && (
          <Dashboard
            department={data.requirements.department}
            admissionYear={data.requirements.admissionYear}
            isVerified={data.requirements.isVerified}
            current={current}
            projected={projected}
            certificationAreas={data.requirements.certificationAreas}
            onChangeCertScore={(areaId, score) =>
              setData(storage.setCertificationScore(areaId, score))
            }
          />
        )}

        {tab === "major" && (
          <MajorCourses
            courses={data.requirements.majorCourses}
            statusMap={data.majorCourseStatus}
            fieldTraining={data.fieldTraining}
            onChangeStatus={(courseId, status) =>
              setData(storage.setMajorCourseStatus(courseId, status))
            }
            onReset={() => setData(storage.resetMajorCourses())}
            onChangeFieldTrainingStatus={(status) =>
              setData(storage.setFieldTrainingStatus(status))
            }
            onChangeFieldTrainingCredits={(credits) =>
              setData(storage.setFieldTrainingCredits(credits))
            }
          />
        )}

        {tab === "general" && (
          <GeneralCourses
            catalog={data.requirements.generalCourseCatalog}
            statusMap={data.generalCourseStatus}
            courses={data.generalCourses}
            onChangeCatalogStatus={(courseId, status) =>
              setData(storage.setGeneralCourseStatus(courseId, status))
            }
            onAdd={(entry) => setData(storage.addGeneralCourse(entry))}
            onRemove={(id) => setData(storage.removeGeneralCourse(id))}
            onChangeStatus={(id, status) =>
              setData(storage.updateGeneralCourseStatus(id, status))
            }
            onReset={() => setData(storage.resetGeneralCourses())}
          />
        )}

        {tab === "chat" && current && projected && (
          <ChatWidget statusSummary={formatStatusSummary(current, projected)} />
        )}

        {tab === "settings" && (
          <Settings
            school={data.requirements.school}
            department={data.requirements.department}
            admissionYear={data.requirements.admissionYear}
            onChangeAcademicUnit={(school, department) =>
              setData(storage.changeAcademicUnit(school, department))
            }
            onChangeYear={(year) => setData(storage.changeAdmissionYear(year))}
          />
        )}
      </main>
    </>
  );
}
