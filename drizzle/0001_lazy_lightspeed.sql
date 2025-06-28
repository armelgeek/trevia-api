ALTER TABLE "schedules" ALTER COLUMN "trip_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "departure_time" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "schedules" ALTER COLUMN "arrival_time" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "trips" DROP COLUMN "arrival_date";